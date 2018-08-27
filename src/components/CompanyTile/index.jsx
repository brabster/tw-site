import React from 'react';
import './style.scss';
import '../../assets/fonts/fontello-771c82e0/css/fontello.css';

class CompanyTile extends React.Component {
  render() {
    return (
      <div className="companyTile">
        <div className="company__title">
          Tempered Works
        </div>
        <div className="company__strapline">
          Consulting in Software and Data Engineering
        </div>
      </div>
    );
  }
}

export default CompanyTile;
