import React from 'react';

export default function NodeCard({ node }: { node: any }) {
  const isHypothesis = node.type === 'hypothesis';

  return (
    <div className="node-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ 
          width: '32px', height: '32px', borderRadius: '50%', 
          background: isHypothesis 
            ? 'linear-gradient(135deg, #001A10, #004030)' 
            : 'linear-gradient(135deg, #3B1F00, #7A4400)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          fontSize: '11px', color: isHypothesis ? '#4ECBA0' : 'var(--gold-lt)', 
          fontWeight: '600' 
        }}>
          {node.author?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: '500' }}>
            {node.author?.full_name || node.author?.username || 'Unknown'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text3)', display: 'flex', gap: '8px', alignItems: 'center' }}>
            {new Date(node.created_at).toLocaleDateString()}
            {node.author_reputation !== undefined && (
              <span style={{ color: 'var(--gold-lt)', fontWeight: 'bold' }}>
                • ⚖️ {node.author_reputation} Rep
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {node.longevity_score > 0 && (
            <span 
              style={{ 
                fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px',
                padding: '2px 6px', borderRadius: '4px',
                background: node.longevity_band === 'foundational' ? 'var(--gold-dim)' : 'var(--bg3)',
                color: node.longevity_band === 'foundational' ? 'var(--gold-lt)' : 'var(--text3)',
                border: '1px solid var(--border2)',
              }}
              title={`Longevity Score: ${Math.round(node.longevity_score * 100)}% - ${node.longevity_reasoning || 'Analyzing durability...'}`}
            >
              {node.longevity_band === 'foundational' ? '🏛️ Foundational' : node.longevity_band}
            </span>
          )}
          <span 
            className="node-type-badge" 
            style={{ 
              marginBottom: 0, 
              ...(isHypothesis ? {
                color: 'var(--orange-lt)', 
                borderColor: 'rgba(212,84,10,0.3)', 
                background: 'rgba(212,84,10,0.1)'
              } : {})
            }}
          >
            {node.type}
          </span>
        </div>
      </div>
      
      <h3 className="node-title">
        <a href={`/node/${node.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {node.title}
        </a>
      </h3>
      <p className="node-preview" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {node.content}
      </p>

      {node.tags && node.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {node.tags.map((t: any) => (
            <span key={t.tag?.name} style={{ padding: '2px 8px', fontSize: '10px', borderRadius: '4px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text3)', textTransform: 'uppercase' }}>
              #{t.tag?.name}
            </span>
          ))}
        </div>
      )}

      <div className="node-footer">
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text3)', cursor: 'pointer' }}>
            💬 {node.node_reactions?.length || 0} Reactions
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text3)', cursor: 'pointer' }}>
            ⚖️ {node.citation_count || 0} Citations
          </span>
        </div>
        <a href={`/node/${node.id}`} style={{ fontSize: '11px', color: 'var(--gold-dim)', textDecoration: 'none' }}>
          🔗 Explore Graph
        </a>
      </div>
    </div>
  );
}
