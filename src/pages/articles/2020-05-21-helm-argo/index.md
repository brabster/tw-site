---
title: Helm Charts for Argo Workflows
date: 2020-05-21T00:00:00+01:00
layout: post
draft: false
path: /posts/helm-charts-for-argo-workflows
category: Data Engineering
tags:
 - kubernetes
 - helm
 - argo
 - how-to
description: Using Helm with Argo is simpler than you think.
---

Argo is a lightweight, Kubernetes-native workflow solution.
Workflows are implemented as Kuberenetes manifests, so Helm is a natural choice for packaging your workflows.

Helm also supports templating values into Kuberetes manifests, which can e really helpful - but thst's where we run into a problem. Helm uses mustache-style string interpolation, and so does Argo.

Here's an example of the problem, based on [Argo's hello world example](https://github.com/argoproj/argo/blob/master/examples/hello-world.yaml).

```yaml
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: hello-world
spec:
  entrypoint: whalesay
  templates:
  - name: whalesay
    container:
      image: docker/whalesay:latest
      command: [cowsay]
      args: [ "{{workflow.name}}" ]
```

WHen we try to install this template, we get an error because Helm tries to interpolate the Argo variable `workflow.name`.

```
$ helm install broken-example .
Error: parse error at (argo-hello-world.example/templates/hello-world.yml:12): function "workflow" not defined
```

# Nesting Interpolation

You *can* solve the problem by wrapping the Argo variable interpolation in Helm variable interpolation and backticks, like this:

```yaml
args: [ {{ `"{{workflow.name}}"` }} ]
```
This approach works.
If our template doens't have too many Argo interpolations, this solution might be fine.
More complex templates, like [this one](https://github.com/argoproj/argo/blob/master/examples/parallelism-nested.yaml), can use a lot or Argo string interpolation.
Manually escaping those expressions would be a pain, and render the workflow templates pretty unreadable. There's a better way.

# Changing Delimiters

If we could chanee the delimiters that either Argo or Helm use to start and end their interpolation expressions, then the two tools could work together. Neither supports that directly (although Argo has [an open issue to implement it](https://github.com/argoproj/argo/issues/2430)). All is not lost though, because Helm supports post-processing the Kubernetes manifests it produces. We can use `sed` to find and replace alternative delimiters for the Argo expressions.

The new delimiters cannot be `{{` and `}}`, and they cannot appear elsewhere in the script. I'll use `{-` and `-}`. Here's an new version of the example workflow manifest with the new delimiters. 

```yaml
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: {{ .Release.Name }}-hello-world
spec:
  entrypoint: whalesay
  templates:
  - name: whalesay
    container:
      image: docker/whalesay:latest
      command: [cowsay]
      args: [ "{-workflow.uid-}" ]
```

The last piece of the puzzle is a shell script to replace the new delimiters after Helm has done its processing. We just need a tiny shell script that pipes `stdin` through `sed` to pass to Helm.

```bash
#!/bin/bash

sed 's/{-/{{/'g | sed 's/-}/}}/g' <&0
```

We've also added the release name Helm variable to the workflow template name, so show that Helm interpolation is still working. Let's install.

```
$ helm install my-release working-chart --post-renderer ./argo-post-processor.sh 
NAME: my-release
LAST DEPLOYED: Thu May 21 17:55:37 2020
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
```
Running the workflow shows that both types of interpolation have been applied successfully. Note the release name `my-release` in the workflow and pod names, and the worflow UID in the whalesay output.

![](argo-success.png)