import React from 'react'

export default function GraphPage() {
  return (
    <div className="animate-in fade-in duration-1000">
      <header style={{ marginBottom: '32px' }}>
        <h1 className="auth-title" style={{ fontSize: '32px' }}>Knowledge Graph</h1>
        <p className="auth-subtitle">The collective neural architecture of THREX</p>
      </header>

      {/* Graph Canvas Placeholder */}
      <div 
        style={{ 
          height: '600px', 
          background: 'var(--bg2)', 
          border: '1px solid var(--border)', 
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="hero-grid" style={{ opacity: 0.05 }} />
        
        {/* Mock Nodes and Connections */}
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div style={{ position: 'absolute', top: '30%', left: '40%', width: '12px', height: '12px', background: 'var(--gold)', borderRadius: '50%', boxShadow: '0 0 20px var(--gold)' }}></div>
          <div style={{ position: 'absolute', top: '50%', left: '60%', width: '8px', height: '8px', background: 'var(--gold-lt)', borderRadius: '50%', opacity: 0.6 }}></div>
          <div style={{ position: 'absolute', top: '70%', left: '30%', width: '8px', height: '8px', background: 'var(--gold-dim)', borderRadius: '50%', opacity: 0.4 }}></div>
          
          {/* Simple SVG Line for Connection */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <line x1="40.6%" y1="31%" x2="59.4%" y2="50%" stroke="var(--border2)" strokeWidth="1" />
            <line x1="40.6%" y1="31%" x2="30.6%" y2="70%" stroke="var(--border2)" strokeWidth="1" />
          </svg>
        </div>

        <div style={{ position: 'absolute', bottom: '24px', left: '24px', background: 'var(--bg3)', padding: '12px 20px', borderRadius: '8px', border: '1px solid var(--border2)' }}>
          <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '4px' }}>Active Nodes</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--gold-lt)' }}>1,248,302</div>
        </div>
      </div>
      
      <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div className="node-card">
          <h4 className="form-label">Spatial Discovery</h4>
          <p className="node-preview" style={{ fontSize: '12px' }}>Navigate ideas through their semantic relationships rather than keywords.</p>
        </div>
        <div className="node-card">
          <h4 className="form-label">Conflict Detection</h4>
          <p className="node-preview" style={{ fontSize: '12px' }}>AI identifies contradictory nodes and highlights them for manual synthesis.</p>
        </div>
        <div className="node-card">
          <h4 className="form-label">Proof of Thought</h4>
          <p className="node-preview" style={{ fontSize: '12px' }}>Every edge in the graph represents a verified logical connection.</p>
        </div>
      </div>
    </div>
  )
}
