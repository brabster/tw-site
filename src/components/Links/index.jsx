import React from 'react';
import './style.scss';
import '../../assets/fonts/fontello-771c82e0/css/fontello.css';

class Links extends React.Component {
  render() {
    const author = this.props.data;

    return (
      <div className="links">
        <h4>Contact</h4>
        <a href={`mailto:${author.email}`}>
          {`${author.email}`}
        </a>
        <ul className="links__list">
          <li className="links__list-item">
            <a href={`https://twitter.com/${author.twitter}`} target="_blank" >
              <i className="icon-twitter" />
            </a>
          </li>
          <li className="links__list-item">
            <a href={`https://github.com/${author.github}`} target="_blank" >
              <i className="icon-github" />
            </a>
          </li>
          <li className="links__list-item">
            <a href={`https://www.linkedin.com/in/${author.linkedin}`} target="_blank" >
              <i className="icon-linkedin" />
            </a>
          </li>
          <li className="links__list-item">
            <a href={`https://stackoverflow.com/users//${author.stackoverflow}`} target="_blank" >
              <i className="icon-stackoverflow" />
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

export default Links;
