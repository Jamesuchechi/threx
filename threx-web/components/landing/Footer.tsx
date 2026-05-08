import React from 'react';

export default function Footer() {
  return (
    <footer>
      <div className="footer-brand">
        <div className="footer-logo">THREX</div>
        <p className="footer-tagline">The internet's layer for serious minds. Where ideas breathe, reputations are built, and the right people find each other.</p>
      </div>
      <div>
        <div className="footer-col-title">Platform</div>
        <ul className="footer-links">
          <li><a href="#">Knowledge Graph</a></li>
          <li><a href="#">AI Matching</a></li>
          <li><a href="#">Reputation System</a></li>
          <li><a href="#">Threx Agent</a></li>
          <li><a href="#">Circles</a></li>
        </ul>
      </div>
      <div>
        <div className="footer-col-title">Company</div>
        <ul className="footer-links">
          <li><a href="#">About</a></li>
          <li><a href="#">Manifesto</a></li>
          <li><a href="#">Blog</a></li>
          <li><a href="#">Careers</a></li>
          <li><a href="#">Press</a></li>
        </ul>
      </div>
      <div>
        <div className="footer-col-title">Legal</div>
        <ul className="footer-links">
          <li><a href="#">Terms of Service</a></li>
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Data Policy</a></li>
          <li><a href="#">Cookie Settings</a></li>
        </ul>
      </div>
      <div className="footer-bottom">
        <span className="footer-copy">© 2025 THREX · All rights reserved</span>
        <span className="footer-copy">Built for serious minds · Lagos, Nigeria</span>
      </div>
    </footer>
  );
}
