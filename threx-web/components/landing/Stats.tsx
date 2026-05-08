import React from 'react';

export default function Stats() {
  return (
    <section className="stats-section">
      <div className="stats-inner">
        <div className="stat-block reveal">
          <span className="stat-val">1B+</span>
          <span className="stat-label">Knowledge workers</span>
        </div>
        <div className="stat-block reveal reveal-delay-1">
          <span className="stat-val">$47B</span>
          <span className="stat-label">Total addressable market</span>
        </div>
        <div className="stat-block reveal reveal-delay-2">
          <span className="stat-val">200</span>
          <span className="stat-label">Founding members</span>
        </div>
        <div className="stat-block reveal reveal-delay-3">
          <span className="stat-val">0</span>
          <span className="stat-label">Competitors doing this</span>
        </div>
      </div>
    </section>
  );
}
