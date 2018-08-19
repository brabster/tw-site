export const fragmentAuthor = graphql`
  fragment SiteMetadata on Site {
    siteMetadata {
      title
      subtitle
      copyright
      url
      menu {
        label
        path
      }
      author {
        name
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
