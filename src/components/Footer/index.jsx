import React from 'react';
import './style.scss';
import '../../assets/fonts/fontello-771c82e0/css/fontello.css';

class Footer extends React.Component {
  render() {
    return (
      <div className="footer">
        <div className="footer__company">
          © All rights reserved.
          Tempered Works Ltd. is registered in England with company number 11372276, VAT number 296417076.
          The registered address is First Floor, Telecom House, 125-135 Preston Road, Brighton BN1 6AF
        </div>
      </div>
    );
  }
}

export default Footer;
