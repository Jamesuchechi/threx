"use client";

import React, { useEffect, useRef, useState } from 'react';

export default function LandingNav() {
  const navRef = useRef<HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (navRef.current) {
        if (window.scrollY > 60) {
          navRef.current.classList.add('scrolled');
        } else {
          navRef.current.classList.remove('scrolled');
        }
      }
    };
    window.addEventListener('scroll', onScroll);
    onScroll(); 
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav id="main-nav" ref={navRef} className={isMenuOpen ? 'menu-open' : ''}>
      <a className="nav-logo" href="#">THREX</a>
      
      <div className={`nav-content ${isMenuOpen ? 'active' : ''}`}>
        <ul className="nav-links">
          <li><a href="#pillars" onClick={() => setIsMenuOpen(false)}>Platform</a></li>
          <li><a href="#how" onClick={() => setIsMenuOpen(false)}>How it works</a></li>
          <li><a href="#reputation" onClick={() => setIsMenuOpen(false)}>Reputation</a></li>
          <li><a href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</a></li>
        </ul>
        
        <div className="nav-actions">
          <a className="btn-login" href="/login">Log In</a>
          <a className="btn-signup" href="/signup">Sign Up</a>
        </div>
      </div>

      <button className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
}
