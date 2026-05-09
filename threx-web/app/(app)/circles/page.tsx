import React from 'react'

export default function CirclesPage() {
  return (
    <div className="animate-in fade-in duration-1000">
      <header style={{ marginBottom: '32px' }}>
        <h1 className="auth-title" style={{ fontSize: '32px' }}>Circles</h1>
        <p className="auth-subtitle">Merit-gated communities for serious collaboration</p>
      </header>

      <div className="dashboard-grid" style={{ padding: 0 }}>
        <section className="feed-area">
          <div className="node-card">
            <div className="node-type">Featured Circle</div>
            <h3 className="node-title">The AI Safety Protocol</h3>
            <p className="node-preview">A high-stakes community focused on formal verification of LLM outputs.</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text3)' }}>124 Active Thinkers</span>
              <button className="nav-tab active" style={{ fontSize: '10px' }}>Apply to Join</button>
            </div>
          </div>

          <div className="node-card">
            <div className="node-type">Public Forum</div>
            <h3 className="node-title">Quantum Meta-Ethics</h3>
            <p className="node-preview">Exploring the intersection of quantum mechanics and normative ethical frameworks.</p>
          </div>
        </section>

        <aside className="dashboard-aside">
          <section>
            <h4 className="form-label">Your Invitations</h4>
            <p style={{ fontSize: '11px', color: 'var(--text2)', fontStyle: 'italic' }}>No pending invitations. Compound your reputation to attract interest.</p>
          </section>
        </aside>
      </div>
    </div>
  )
}
