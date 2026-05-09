import { createClient } from '../../../lib/supabase/server';
import React from 'react';
import NodeCard from '../../../components/nodes/NodeCard';

export default async function ClaimsPage() {
  const supabase = await createClient();

  const { data: claims } = await supabase
    .from('claims')
    .select('*, node:nodes(*, author:profiles(*), node_tags(tag:tags(*)), node_reactions(*))')
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  return (
    <div style={{ padding: '40px' }}>
      <header style={{ marginBottom: '48px' }}>
        <h1 className="auth-title" style={{ fontSize: '32px', marginBottom: '8px' }}>The Intellectual Market</h1>
        <p className="auth-subtitle">Verify, challenge, or stake your reputation on active claims</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
        {claims?.map((claim: any) => (
          <div key={claim.id} style={{ position: 'relative' }}>
             <NodeCard node={claim.node} />
             <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
                <span style={{ fontSize: '10px', background: 'var(--gold)', color: 'var(--bg)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                   OPEN CLAIM ⚖️
                </span>
             </div>
          </div>
        ))}
      </div>

      {(!claims || claims.length === 0) && (
        <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.5 }}>
           <p style={{ fontSize: '18px', fontStyle: 'italic' }}>The intellectual market is currently quiet.</p>
           <p style={{ fontSize: '12px', marginTop: '8px' }}>Be the first to stake a formal claim.</p>
        </div>
      )}
    </div>
  );
}
