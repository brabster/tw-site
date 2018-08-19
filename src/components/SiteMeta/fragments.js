export const fragmentAuthor = graphql`
  fragment SiteMetadata on Site {
    siteMetadata {
      title
      subtitle
      copyright
      companyInfo
      companyAddress
      url
      menu {
        label
        path
      }
      author {
        name
        affiliation
        email
        twitter
        github
        linkedin
        stackoverflow
        rss
      }
    }
  }
`;
