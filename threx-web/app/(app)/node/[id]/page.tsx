import React from 'react';
import { createClient } from '../../../../lib/supabase/server';
import { notFound } from 'next/navigation';
import SimilarNodes from '../../../../components/nodes/SimilarNodes';
import GraphConnections from '../../../../components/nodes/GraphConnections';
import ClaimEngagement from '../../../../components/nodes/ClaimEngagement';
import ClaimResolution from '../../../../components/nodes/ClaimResolution';

export const revalidate = 60; // ISR every 60s

export default async function NodeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch node with author profile
  const { data: node, error } = await supabase
    .from('nodes')
    .select(`
      *,
      author:profiles(*),
      tags:node_tags(tag:tags(name))
    `)
    .eq('id', id)
    .single();

  if (error || !node || node.deleted_at) {
    return notFound();
  }

  // Fetch reactions breakdown
  const { data: reactions } = await supabase
    .from('node_reactions')
    .select('type')
    .eq('node_id', id);

  const reactionCounts = {
    builds_on: 0,
    challenges: 0,
    need_evidence: 0,
    fascinating: 0
  };

  reactions?.forEach(r => {
    if (r.type in reactionCounts) {
      reactionCounts[r.type as keyof typeof reactionCounts]++;
    }
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 0' }}>
      
      {/* Back to Feed */}
      <a href="/feed" style={{ display: 'inline-block', marginBottom: '24px', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '2px', textDecoration: 'none' }}>
        ← Back to Pulse
      </a>

      {/* Node Header */}
      <header style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <span className="node-type-badge" style={{ marginBottom: 0 }}>{node.type}</span>
          <span style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {new Date(node.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {node.longevity_score > 0 && (
            <span 
              style={{ 
                fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px',
                padding: '4px 10px', borderRadius: '6px',
                background: node.longevity_band === 'foundational' ? 'var(--gold-dim)' : 'var(--bg3)',
                color: node.longevity_band === 'foundational' ? 'var(--gold-lt)' : 'var(--text3)',
                border: '1px solid var(--border2)',
              }}
            >
              🏛️ {node.longevity_band} Score: {Math.round(node.longevity_score * 100)}
            </span>
          )}
          {node.longevity_reasoning && (
             <div style={{ fontSize: '11px', color: 'var(--text3)', background: 'var(--bg3)', padding: '4px 12px', borderRadius: '4px', border: '1px dashed var(--border2)' }}>
                <strong>Logic Receipt:</strong> {node.longevity_reasoning}
             </div>
          )}
          {node.visibility !== 'public' && (
            <span style={{ fontSize: '11px', color: 'var(--orange-lt)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px' }}>
              {node.visibility === 'circle' ? '⭕ Circle Only' : '🔒 Private'}
            </span>
          )}
        </div>

        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '36px', fontWeight: '700', color: 'var(--text)', marginBottom: '16px', lineHeight: 1.3 }}>
          {node.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold-dim), var(--orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: 'var(--bg)', fontWeight: '700' }}>
            {node.author?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
              {node.author?.full_name || node.author?.username}
            </div>
            <a href={`/u/${node.author?.username}`} style={{ fontSize: '12px', color: 'var(--gold-dim)', textDecoration: 'none' }}>
              @{node.author?.username}
            </a>
          </div>
        </div>
      </header>

      {/* Node Content */}
      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '16px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '48px', whiteSpace: 'pre-wrap' }}>
        {node.content}
      </div>

      <SimilarNodes nodeId={node.id} title={node.title} />

      <GraphConnections nodeId={node.id} />

      <ClaimEngagement nodeId={node.id} />

      {/* Resolution UI for Authors */}
      {node.author_id === (await (await supabase).auth.getUser()).data.user?.id && (
         <ClaimResolution nodeId={node.id} />
      )}

      {/* Tags */}
      {node.tags && node.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {node.tags.map((t: any) => (
            <span key={t.tag.name} style={{ padding: '6px 14px', fontSize: '11px', borderRadius: '20px', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              #{t.tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Nuanced Reactions */}
      <section style={{ borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
        <h3 style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', fontWeight: '600' }}>
          Intellectual Response
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          
          <button style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
            <span style={{ fontSize: '20px' }}>🧱</span>
            <span style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '1px' }}>Builds on this</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--gold-lt)' }}>{reactionCounts.builds_on}</span>
          </button>

          <button style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
            <span style={{ fontSize: '20px' }}>⚡</span>
            <span style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '1px' }}>Challenges</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--gold-lt)' }}>{reactionCounts.challenges}</span>
          </button>

          <button style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
            <span style={{ fontSize: '20px' }}>🔬</span>
            <span style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '1px' }}>Needs Evidence</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--gold-lt)' }}>{reactionCounts.need_evidence}</span>
          </button>

          <button style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
            <span style={{ fontSize: '20px' }}>🌌</span>
            <span style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '1px' }}>Fascinating</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--gold-lt)' }}>{reactionCounts.fascinating}</span>
          </button>

        </div>
      </section>

    </div>
  );
}
