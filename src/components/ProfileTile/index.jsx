import React from 'react';
import './style.scss';
import '../../assets/fonts/fontello-771c82e0/css/fontello.css';

const ProfileTile = () => (
  <div>
    <img
      src="profile.jpeg"
      className="profile__author-photo"
      width="75"
      height="75"
      alt="Paul Brabban profile"
    />
  </div>
);

export default ProfileTile;
