import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          SkillSync
        </div>
        <div className="footer-links">
          <Link to="/">About</Link>
          <Link to="/">Privacy Policy</Link>
          <Link to="/">Terms of Service</Link>
          <Link to="/">Contact</Link>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} SkillSync Project. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
