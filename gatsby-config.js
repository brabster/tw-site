const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.google-analytics.com",
  "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https://www.google-analytics.com"
];

const directivesToCspHeader = headers => headers.join(';');

module.exports = {
  siteMetadata: {
    url: 'https://tempered.works',
    title: 'Tempered Works Ltd. Software Consulting',
    subtitle: 'Consultancy, contracting and coaching for software development and data engineering. Based in Sheffield, UK.',
    companyInfo: 'Tempered Works Ltd. is registered in England with company number 11372276, VAT number 296417076.',
    companyAddress: 'First Floor, Telecom House, 125-135 Preston Road, Brighton BN1 6AF',
    copyright: '© All rights reserved.',
    disqusShortname: '',
    menu: [
      {
        label: 'Blog',
        path: '/'
      },
      {
        label: 'Publications',
        path: '/publications'
      },
      {
        label: 'About Tempered Works',
        path: '/about'
      }
    ],
    author: {
      name: 'Paul Brabban',
      affiliation: 'Tempered Works Ltd.',
      email: 'paul@tempered.works',
      twitter: 'brabster',
      github: 'brabster',
      linkedin: 'paulbrabban',
      stackoverflow: '2362/brabster',
      rss: '/rss.xml'
    }
  },
  plugins: [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/pages`,
        name: 'pages'
      }
    },
    {
      resolve: 'gatsby-plugin-feed',
      options: {
        query: `
          {
            site {
              siteMetadata {
                site_url: url
                title
                description: subtitle
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) => (
              allMarkdownRemark.edges.map(edge => Object.assign({}, edge.node.frontmatter, {
                description: edge.node.frontmatter.description,
                date: edge.node.frontmatter.date,
                url: site.siteMetadata.site_url + edge.node.fields.slug,
                guid: site.siteMetadata.site_url + edge.node.fields.slug,
                custom_elements: [{ 'content:encoded': edge.node.html }]
              }))
            ),
            query: `
              {
                allMarkdownRemark(
                  limit: 1000,
                  sort: { order: DESC, fields: [frontmatter___date] },
                  filter: { frontmatter: { layout: { eq: "post" }, draft: { ne: true } } }
                ) {
                  edges {
                    node {
                      html
                      fields {
                        slug
                      }
                      frontmatter {
                        title
                        date
                        layout
                        draft
                        description
                      }
                    }
                  }
                }
              }
            `,
            output: '/rss.xml'
          }
        ]
      }
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-images',
            options: { maxWidth: 960 }
          },
          {
            resolve: 'gatsby-remark-responsive-iframe',
            options: { wrapperStyle: 'margin-bottom: 1.0725rem' }
          },
          'gatsby-remark-prismjs',
          'gatsby-remark-copy-linked-files',
          'gatsby-remark-smartypants'
        ]
      }
    },
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: { trackingId: 'UA-' }
    },
    {
      resolve: 'gatsby-plugin-google-fonts',
      options: { fonts: ['roboto:400,400i,500,700'] }
    },
    {
      resolve: 'gatsby-plugin-sitemap',
      options: {
        query: `
            {
              site {
                siteMetadata {
                  url
                }
              }
              allSitePage(
                filter: {
                  path: { regex: "/^(?!/404/|/404.html|/dev-404-page/)/" }
                }
              ) {
                edges {
                  node {
                    path
                  }
                }
              }
          }`,
        output: '/sitemap.xml',
        serialize: ({ site, allSitePage }) => allSitePage.edges.map((edge) => {
          return {
            url: site.siteMetadata.url + edge.node.path,
            changefreq: 'daily',
            priority: 0.7
          };
        })
      }
    },
    'gatsby-plugin-offline',
    'gatsby-plugin-catch-links',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-postcss-sass',
    {
      resolve: 'gatsby-plugin-netlify',
      options: {
        headers: {
          '/*': [
            'X-Frame-Options: DENY',
            'X-XSS-Protection: 1; mode=block',
            'X-Content-Type-Options: nosniff',
            `Content-Security-Policy: ${directivesToCspHeader(cspDirectives)}`,
            'Referrer-Policy: no-referrer-when-downgrade'
          ]
        }
      }
    }
  ]
};
