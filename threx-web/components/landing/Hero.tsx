"use client";

import React, { useState, useEffect } from 'react';

export default function Hero() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const colors = ['#C8920A','#D97706','#C2410C','#7A5800','#3D2C00'];
    const generatedParticles = Array.from({ length: 28 }).map((_, i) => {
      const size = Math.random() * 3 + 1;
      return {
        id: i,
        size,
        left: `${Math.random() * 100}%`,
        background: colors[Math.floor(Math.random() * colors.length)],
        animationDuration: `${Math.random() * 20 + 15}s`,
        animationDelay: `${Math.random() * 20}s`
      };
    });
    setParticles(generatedParticles);
  }, []);

  return (
    <section className="hero">
      <div className="hero-grid"></div>
      <div className="particles" id="particles">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              width: p.size + 'px',
              height: p.size + 'px',
              left: p.left,
              background: p.background,
              animationDuration: p.animationDuration,
              animationDelay: p.animationDelay,
              opacity: 0
            }}
          />
        ))}
      </div>

      <div className="hero-eyebrow">Announcing Private Beta 2025</div>

      <h1 className="hero-title">THREX</h1>
      <p className="hero-subtitle-line">The Internet's Layer for Serious Minds</p>

      <p className="hero-tagline">
        Where your <em>ideas connect</em> to the right people,<br/>
        your <em>reputation compounds</em> over time,<br/>
        and your <em>AI agent works</em> while you sleep.
      </p>

      <div className="hero-actions">
        <a className="btn-primary" href="#early-access"><span>Request Early Access</span></a>
        <a className="btn-secondary" href="#how">See How It Works</a>
      </div>

      <div className="hero-diagram">
        <svg width="700" height="220" viewBox="0 0 700 220">
          <defs>
            <radialGradient id="ng1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C8920A" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#C8920A" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="ng2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C2410C" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#C2410C" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <ellipse cx="350" cy="110" rx="120" ry="80" fill="url(#ng1)"/>
          <ellipse cx="530" cy="80" rx="80" ry="60" fill="url(#ng2)"/>
          <g stroke="#2C1E00" strokeWidth="1" fill="none">
            <line x1="350" y1="110" x2="180" y2="60"/>
            <line x1="350" y1="110" x2="520" y2="70"/>
            <line x1="350" y1="110" x2="220" y2="175"/>
            <line x1="350" y1="110" x2="490" y2="170"/>
            <line x1="520" y1="70" x2="620" y2="40"/>
            <line x1="180" y1="60" x2="80" y2="40"/>
            <line x1="220" y1="175" x2="110" y2="190"/>
            <line x1="490" y1="170" x2="600" y2="195"/>
            <line x1="350" y1="110" x2="350" y2="195"/>
          </g>
          <g stroke="#7A5800" strokeWidth="1.5" fill="none" opacity="0.8">
            <line x1="350" y1="110" x2="180" y2="60"/>
            <line x1="350" y1="110" x2="520" y2="70"/>
          </g>
          <circle cx="350" cy="110" r="36" fill="#181000" stroke="#C8920A" strokeWidth="1.5"/>
          <circle cx="350" cy="110" r="42" fill="none" stroke="#C8920A" strokeWidth="0.5" opacity="0.3" strokeDasharray="4 3"/>
          <text x="350" y="106" textAnchor="middle" fill="#F0B429" fontSize="10" fontFamily="Cinzel, serif" fontWeight="600">Your</text>
          <text x="350" y="120" textAnchor="middle" fill="#F0B429" fontSize="10" fontFamily="Cinzel, serif" fontWeight="600">Ideas</text>
          <circle cx="180" cy="60" r="24" fill="#181000" stroke="#7A5800" strokeWidth="1.2"/>
          <text x="180" y="56" textAnchor="middle" fill="#C8920A" fontSize="8.5" fontFamily="Cinzel, serif">Knowledge</text>
          <text x="180" y="68" textAnchor="middle" fill="#C8920A" fontSize="8.5" fontFamily="Cinzel, serif">Graph</text>
          <circle cx="520" cy="70" r="24" fill="#181000" stroke="#7A5800" strokeWidth="1.2"/>
          <text x="520" y="66" textAnchor="middle" fill="#C8920A" fontSize="8.5" fontFamily="Cinzel, serif">AI</text>
          <text x="520" y="78" textAnchor="middle" fill="#C8920A" fontSize="8.5" fontFamily="Cinzel, serif">Matching</text>
          <circle cx="220" cy="175" r="20" fill="#160800" stroke="#5A3000" strokeWidth="1"/>
          <text x="220" y="178" textAnchor="middle" fill="#D97706" fontSize="8" fontFamily="Cinzel, serif">Reputation</text>
          <circle cx="490" cy="170" r="20" fill="#160800" stroke="#5A3000" strokeWidth="1"/>
          <text x="490" y="173" textAnchor="middle" fill="#D97706" fontSize="8" fontFamily="Cinzel, serif">Circles</text>
          <circle cx="350" cy="195" r="16" fill="#100800" stroke="#2C1E00" strokeWidth="1"/>
          <text x="350" y="198" textAnchor="middle" fill="#524020" fontSize="7.5" fontFamily="Cinzel, serif">Agent</text>
          <circle cx="620" cy="40" r="12" fill="#100800" stroke="#1E1500" strokeWidth="1"/>
          <text x="620" y="43" textAnchor="middle" fill="#3D2C00" fontSize="7" fontFamily="DM Sans">Research</text>
          <circle cx="80" cy="40" r="12" fill="#100800" stroke="#1E1500" strokeWidth="1"/>
          <text x="80" y="43" textAnchor="middle" fill="#3D2C00" fontSize="7" fontFamily="DM Sans">Claims</text>
          <circle cx="110" cy="190" r="12" fill="#100800" stroke="#1E1500" strokeWidth="1"/>
          <text x="110" y="193" textAnchor="middle" fill="#3D2C00" fontSize="7" fontFamily="DM Sans">Collab</text>
          <circle cx="600" cy="195" r="12" fill="#100800" stroke="#1E1500" strokeWidth="1"/>
          <text x="600" y="198" textAnchor="middle" fill="#3D2C00" fontSize="7" fontFamily="DM Sans">Grants</text>
        </svg>
      </div>

      <div className="scroll-hint">
        <span className="scroll-hint-text">Scroll</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
}
