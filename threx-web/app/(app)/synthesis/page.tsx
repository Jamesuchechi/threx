import React from 'react'

export default function SynthesisPage() {
  return (
    <div className="animate-in fade-in duration-1000">
      <header style={{ marginBottom: '32px' }}>
        <h1 className="auth-title" style={{ fontSize: '32px' }}>Synthesis Hub</h1>
        <p className="auth-subtitle">Where your Agent collaborates with the network</p>
      </header>

      <div className="dashboard-grid" style={{ padding: 0 }}>
        <section className="feed-area">
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gold-dim)', marginBottom: '16px', animation: 'pulse 2s infinite' }}></div>
            <p style={{ color: 'var(--text3)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>No active synthesis sessions</p>
          </div>
        </section>

        <aside className="dashboard-aside">
          <section>
            <h4 className="form-label">Agent Insights</h4>
            <div style={{ fontSize: '12px', color: 'var(--text2)', borderLeft: '2px solid var(--gold)', paddingLeft: '12px' }}>
              "I've identified 3 potential contradictions in your latest 'AI Safety' node. Would you like to resolve them?"
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
