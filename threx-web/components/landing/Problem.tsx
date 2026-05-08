import React from 'react';

export default function Problem() {
  return (
    <section className="problem-section">
      <div className="problem-grid">
        <div>
          <div className="section-label reveal">The Problem</div>
          <h2 className="section-title reveal reveal-delay-1">Brilliant minds are<br/><em>invisible</em> to each other.</h2>
          <p className="section-body reveal reveal-delay-2">
            The internet is full of exceptional thinkers whose ideas sit in private folders, whose reputations exist only in job titles, and whose perfect collaborators are somewhere on the same platform — unknown to them.
          </p>
        </div>
        <div className="problem-cards">
          <div className="problem-card reveal">
            <div className="problem-card-icon">🏢</div>
            <div className="problem-card-name">LinkedIn</div>
            <div className="problem-card-desc">Rewards connections, not competence. Your profile is a static declaration, not a proof of work.</div>
          </div>
          <div className="problem-card reveal reveal-delay-1">
            <div className="problem-card-icon">📢</div>
            <div className="problem-card-name">Twitter / X</div>
            <div className="problem-card-desc">Rewards virality. Depth is punished. The loudest voice wins, not the sharpest mind.</div>
          </div>
          <div className="problem-card reveal reveal-delay-2">
            <div className="problem-card-icon">📁</div>
            <div className="problem-card-name">Notion / Obsidian</div>
            <div className="problem-card-desc">Your best thinking dies in private silos. Brilliant ideas never find their audience.</div>
          </div>
          <div className="problem-card reveal reveal-delay-3">
            <div className="problem-card-icon">🎓</div>
            <div className="problem-card-name">Academia</div>
            <div className="problem-card-desc">Knowledge gated behind paywalls and publishing cycles measured in years, not days.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
