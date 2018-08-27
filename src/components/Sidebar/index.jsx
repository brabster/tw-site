import React from 'react';
import Menu from '../Menu';
import Links from '../Links';
import CompanyTile from '../CompanyTile';
import './style.scss';

const Sidebar = ({ data: { site: { siteMetadata: { author, menu } } } }) => (
  <div className="sidebar">
    <div className="sidebar__inner">
      <CompanyTile />
      <div>
        <Menu data={menu} />
        <Links data={author} />
      </div>
    </div>
  </div>
);

export default Sidebar;
