---
title: "A Spring Boot Performance Problem"
date: "2019-01-07T19:58:00.000Z"
layout: post
draft: false
path: "/posts/spring-boot-performance-part-1"
category: "devops"
tags:
 - "web-development"
 - "performance-testing"
 - "spring-boot"
 - "spring-security"
 - "gatling"
 - "java"
 - "scala"
description: "The surprisingly poor performance of a basic Spring Boot webapp. Part 1 of a series."
---

Just after the rest of the team had left for their Christmas holidays, my colleague and I discovered a weird performance problem with a Spring Boot application we'd just started writing.
This is a the story of discovering the problem and the detective work that led us to the culprit hiding in plain sight.
We're going to recreate the app and the performance tests, but first I'll tell you how we got here.

## Prologue

Twenty requests per second.
Any more than that and response times would climb.
Eventually, the load balancer's readiness checks would timeout and it'd refuse to send traffic to the app, taking the service offline.

We're building an API, rather than a website. Clients authenticate with HTTP basic, by passing an encoded version of a username and password. Each request is a query. The app makes a few queries to a graph database and calculates an answer as a JSON document.
It's running in a Kubernetes cluster on AWS, behind an Elastic Load Balancer.
How can it be struggling to serve more than twenty requests per second?
I've not used this graph database before, can it really be that slow? Nor have I used Kubernetes or Spring Boot, are they responsible?

There's too many potential culprits here, so let's eliminate some. Can I reproduce the problem here on my machine? Yes - and I get a clue. As the test runs, I can hear the fan spinning up. Checking back on AWS for server metrics, the CPU utilisation was shooting up to 100% during the test. That removes Kubernetes, the load balancer, the network and disks from the investigation, at least for now. Memory could still be a problem, as Java's garbage collection chews up compute time when there's not enough memory.

Now we eliminate the database. We'd written a resource to return version information, which is just returning a document from memory. Running the performance test on that endpoint revealed the same terrible performance! Something to do with Spring then - where can we go from here?

Back to basics. A "getting started" Spring Boot app won't take long to set up. We can eliminate JSON processing, configuration problems and coding errors as potential candidates, and get a benchmark for how performant the simplest Spring Boot app is with our hardware and test setup.

This is where we join the story.

## The "Getting Started" App

You'll find and clone the project we're talking about in this post on Github at https://github.com/brabster/performance-with-spring-boot/tree/1.0. You'll need a JDK and Maven installed to compile and run the application.

I based the "getting started" app closely on [Spring Boot's documentation](https://spring.io/guides/gs/spring-boot/). It's got one endpoint at `/` and returns the plain string "Greetings from Spring Boot!" like this:

```java
@RestController
public class HelloController {

    @RequestMapping("/")
    public String index() {
        return "Greetings from Spring Boot!";
    }

}
```

We'll use Spring Security to authenticate users and API clients, so we need to add the dependencies and set a default username and password. The dependencies we need to add to our Maven `pom.xml` file are:

```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-web</artifactId>
    <version>5.1.2.RELEASE</version>
</dependency>
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-config</artifactId>
    <version>5.1.2.RELEASE</version>
</dependency>
```

To set a default username and password, we add a properties file `src/main/resources/application.properties` containing two properties that override Spring Security's defaults:

```
spring.security.user.name=user
spring.security.user.password=24gh39ugh0
```

Start the app with `mvn spring-boot:run` and you should see something like this:

![](start-app.gif)

## Performance Testing with Gatling

[Gatling](https://gatling.io/) is the tooling that gave me those requests per second figures, so we'll use it to do our performance tests. Gatling tests are written in Scala and can coexist with the Java code, but we need a little support in our project to run tests and get editor support for Scala.

To compile Scala code, and enable Scala support (at least in IntelliJ IDEA) I used the rather neat [scala-maven-plugin](https://davidb.github.io/scala-maven-plugin/index.html):

```xml
<plugin>
    <groupId>net.alchim31.maven</groupId>
    <artifactId>scala-maven-plugin</artifactId>
    <version>3.4.4</version>
    <executions>
        <execution>
            <id>scala-test-compile</id>
            <phase>process-test-resources</phase>
            <goals>
                <goal>testCompile</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

To run Gatling from Maven and view its output, we need a dependency and a plugin:

```xml
<dependency>
    <groupId>io.gatling.highcharts</groupId>
    <artifactId>gatling-charts-highcharts</artifactId>
    <scope>test</scope>
    <version>3.0.2</version>
</dependency>
```

```xml
<plugin>
    <groupId>io.gatling</groupId>
    <artifactId>gatling-maven-plugin</artifactId>
    <version>3.0.1</version>
</plugin>
```

Now we can write a Gatling test. This is our scenario, describing the client behaviour we want to test.

```scala
setUp(myScenario.inject(
    incrementUsersPerSec(20)
      .times(5)
      .eachLevelLasting(5 seconds)
      .startingFrom(20)
  )).protocols(httpProtocol)
    .assertions(global.successfulRequests.percent.is(100))
```

We're starting with 20 users per second making a request to the `/` resource, holding at that concurrency for five seconds. They only make one request. Then we increase the number of users per second by twenty, five times, holding for five seconds each time. Simple! You'll find the test in [LoadTest.scala](https://github.com/brabster/performance-with-spring-boot/blob/1.0/src/test/scala/hello/LoadTest.scala).

Make sure the app is running and then run the test with `mvn gatling:test`.

![](perf-test-1.gif)

When the tests run you see a progress bar being refreshed every few seconds. The `###` part represents the proportion of requests that have been made and completed. The section with dashes `---` is requests made but not yet completed. The numbers are just below the progress bar, `active` telling us how many requests have been made but not yet completed. There's a lot of those, over a thousand towards the end of the test, and this computer isn't exactly underpowered. There's our performance problem! Towards the end of the test, requests are taking over 26 seconds to complete.

If you cloned the project, you can try changing the scenario in [LoadTest.scala](https://github.com/brabster/performance-with-spring-boot/blob/1.0/src/test/scala/hello/LoadTest.scala) to explore the problem. Running something like `top` will show you your live CPU utilisation. I can see the app using almost a full 4 cores while the test is running.

## Gatling's Reports

Gatling saves a report for each test. The "Response Time Distribution" report tells us that the fastest few requests are served in around 200ms, and then there's an even distribution of request times up to 30 seconds. The test only ran for around 70 seconds in total.

![Bar chart showing 15 requests responded in around 200 milliseconds, with other requests uniformly distributed up to almost 30 seconds](gatling-slow-response-time-distribution.png)

The "Number of reuqests per second" chart shows more clearly that the app isn't keeping up, even with these low request rates. The number of active users (those that have made a requests and not yet had a response) climbs until Gatling stops sending new requests.

![Bar chart showing 15 requests responded in around 200 milliseconds, with other requests uniformly distributed up to almost 30 seconds](gatling-slow-request-response-rate.png)

Gatling's reports show you plenty of other interesting charts and figures. Find them in your `target` directory after running a test.

## Next Time

That's the context, the tools and a simple codebase to get us started. Next time, we'll see how a performance problem shows itself and figure out how to resolve it.