import React from 'react';
import Helmet from 'react-helmet';
import Footer from '../components/Footer';
import '../assets/scss/init.scss';
import './style.scss';

const Layout = ({ children }) => (
  <div className="layout site">
    <Helmet defaultTitle="Tempered Works | Consulting in Software and Data Engineering" />
    <main className="site__content">
      {children()}
    </main>
    <Footer />
  </div>
);

export default Layout;
