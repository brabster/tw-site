import React from 'react';
import Helmet from 'react-helmet';
import Footer from '../components/Footer';
import '../assets/scss/init.scss';
import './style.scss';

class Layout extends React.Component {
  render() {
    const { children } = this.props;

    return (
      <div className="layout site">
        <Helmet defaultTitle="Tempered Works | Consulting in Software and Data Engineering" />
        <main className="site__content">
        {children()}
        </main>
        <Footer/>
      </div>
    );
  }
}

export default Layout;
