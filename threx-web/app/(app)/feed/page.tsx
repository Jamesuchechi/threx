import React from 'react'
import { createClient } from '../../../lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <div className="animate-in fade-in duration-700">
      {/* Compose Box */}
      <div className="feed-compose">
        <div className="compose-avatar">
          {profile?.username?.[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, fontSize: '13px', color: 'var(--text3)' }}>
          Share an observation, claim, or hypothesis...
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['Claim', 'Hypothesis', 'Essay'].map(type => (
            <span key={type} style={{ padding: '4px 10px', fontSize: '10px', borderRadius: '6px', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text2)', cursor: 'pointer' }}>
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto' }}>
        {['All Pulse', 'My Network', 'Top Consensus', 'High Contradiction'].map((filter, i) => (
          <span key={filter} style={{ 
            padding: '6px 14px', 
            fontSize: '11px', 
            borderRadius: '20px', 
            border: '1px solid var(--border2)', 
            color: i === 0 ? 'var(--gold-lt)' : 'var(--text2)', 
            background: i === 0 ? 'var(--gold-dim)' : 'transparent',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}>
            {filter}
          </span>
        ))}
      </div>

      {/* Feed Nodes */}
      <div className="node-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #3B1F00, #7A4400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--gold-lt)', fontWeight: '600' }}>
            A
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: '500' }}>Archetype_01</div>
            <div style={{ fontSize: '10px', color: 'var(--text3)' }}>2 hours ago</div>
          </div>
          <span className="node-type-badge" style={{ marginBottom: 0 }}>Claim</span>
        </div>
        
        <h3 className="node-title">The Singularity of Verified Intelligence</h3>
        <p className="node-preview">
          If an AI can prove its own next iteration is safe, we enter a recursive loop of formal certainty that bypasses the alignment problem...
        </p>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
          {['AI Safety', 'Formal Logic'].map(tag => (
            <span key={tag} style={{ padding: '2px 8px', fontSize: '10px', borderRadius: '4px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text3)' }}>
              #{tag}
            </span>
          ))}
        </div>

        <div className="node-footer">
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text3)', cursor: 'pointer' }}>💬 12 Connections</span>
            <span style={{ fontSize: '11px', color: 'var(--text3)', cursor: 'pointer' }}>⚖️ 84% Consensus</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--gold-dim)' }}>🔗 Explore Graph</span>
        </div>
      </div>

      <div className="node-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #001A10, #004030)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#4ECBA0', fontWeight: '600' }}>
            B
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: '500' }}>BioThinker</div>
            <div style={{ fontSize: '10px', color: 'var(--text3)' }}>5 hours ago</div>
          </div>
          <span className="node-type-badge" style={{ marginBottom: 0, color: 'var(--orange-lt)', borderColor: 'rgba(212,84,10,0.3)', background: 'rgba(212,84,10,0.1)' }}>Hypothesis</span>
        </div>
        
        <h3 className="node-title">Synthetic Neural Interfaces and Latency</h3>
        <p className="node-preview">
          Current BCI technology is limited by biological throughput. Synthetic neurotransmitters could potentially increase bandwidth by 100x...
        </p>
      </div>
    </div>
  )
}
