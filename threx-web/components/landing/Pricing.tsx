import React from 'react';

export default function Pricing() {
  return (
    <section className="pricing-section" id="pricing">
      <div className="pricing-inner">
        <div className="pricing-header">
          <div className="section-label reveal">Pricing</div>
          <h2 className="section-title reveal reveal-delay-1">Start free.<br/><em>Scale</em> as you grow.</h2>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card reveal">
            <div className="pricing-tier">Free</div>
            <div className="pricing-price">$0</div>
            <div className="pricing-period">forever</div>
            <div className="pricing-divider"></div>
            <ul className="pricing-features">
              <li>Core knowledge graph</li>
              <li>Basic AI matching (3/day)</li>
              <li>Public reputation score</li>
              <li>Access to public circles</li>
              <li>5 nodes per month</li>
            </ul>
            <button className="pricing-btn">Get Started</button>
          </div>
          <div className="pricing-card featured reveal reveal-delay-1">
            <div className="pricing-badge">Most Popular</div>
            <div className="pricing-tier">Pro</div>
            <div className="pricing-price">$20</div>
            <div className="pricing-period">per month · billed annually</div>
            <div className="pricing-divider"></div>
            <ul className="pricing-features">
              <li>Unlimited nodes</li>
              <li>Private knowledge graph</li>
              <li>Advanced AI agent</li>
              <li>Unlimited matching</li>
              <li>Live document collaboration</li>
              <li>Analytics & graph insights</li>
              <li>Opportunity radar</li>
            </ul>
            <button className="pricing-btn">Start Pro Trial</button>
          </div>
          <div className="pricing-card reveal reveal-delay-2">
            <div className="pricing-tier">Builder</div>
            <div className="pricing-price">$50</div>
            <div className="pricing-period">per month · billed annually</div>
            <div className="pricing-divider"></div>
            <ul className="pricing-features">
              <li>Everything in Pro</li>
              <li>Co-founder matching flow</li>
              <li>Live research layer</li>
              <li>Priority agent processing</li>
              <li>Challenge board access</li>
              <li>Mentor-apprentice tools</li>
              <li>Early access to new features</li>
            </ul>
            <button className="pricing-btn">Start Builder Trial</button>
          </div>
        </div>
        <p style={{textAlign: "center", marginTop: "32px", fontSize: "12px", color: "var(--text3)", letterSpacing: "1px"}}>
          Org ($300/mo) · Talent Access ($500/mo) · Enterprise (custom) — <a href="#" style={{color: "var(--gold-dim)", textDecoration: "none"}}>Contact us</a>
        </p>
      </div>
    </section>
  );
}
