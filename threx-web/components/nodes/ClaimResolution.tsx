"use client";

import React from 'react';
import { createClient } from '../../lib/supabase/client';

export default function ClaimResolution({ nodeId }: { nodeId: string }) {
  const supabase = createClient();

  const handleResolve = async (resolution: 'resolved_true' | 'resolved_false') => {
    const claimRes = await supabase.from('claims').select('id').eq('node_id', nodeId).single();
    if (claimRes.data) {
      const response = await fetch('/api/ai/reputation/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim_id: claimRes.data.id, resolution })
      });
      if (response.ok) {
        alert(`Claim resolved as ${resolution.replace('resolved_', '').toUpperCase()}. Reputation settled.`);
        window.location.reload();
      }
    }
  };

  return (
    <div style={{ marginTop: '32px', padding: '24px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '12px' }}>
      <h4 style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>Author Resolution Tools</h4>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          onClick={() => handleResolve('resolved_true')}
          className="nav-cta" style={{ background: 'var(--green)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Resolve as TRUE
        </button>
        <button 
          onClick={() => handleResolve('resolved_false')}
          className="nav-cta" style={{ background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Resolve as FALSE
        </button>
      </div>
    </div>
  );
}
