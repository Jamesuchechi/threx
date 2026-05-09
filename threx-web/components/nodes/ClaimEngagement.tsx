"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function ClaimEngagement({ nodeId }: { nodeId: string }) {
  const [claim, setClaim] = useState<any>(null);
  const [position, setPosition] = useState<'agree' | 'disagree' | null>(null);
  const [confidence, setConfidence] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchClaim() {
      const { data } = await supabase
        .from('claims')
        .select('*')
        .eq('node_id', nodeId)
        .single();
      
      if (data) {
        setClaim(data);
        // Check if already voted
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: pos } = await supabase
            .from('claim_positions')
            .select('*')
            .eq('claim_id', data.id)
            .eq('user_id', user.id)
            .single();
          if (pos) setHasVoted(true);
        }
      }
    }
    fetchClaim();
  }, [nodeId]);

  const handleSubmit = async () => {
    if (!position || !claim) return;
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    try {
      const { error } = await supabase.from('claim_positions').insert({
        claim_id: claim.id,
        user_id: user?.id,
        position,
        confidence
      });
      if (error) throw error;
      setHasVoted(true);
    } catch (err) {
      console.error("Failed to stake position:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!claim) return null;
  if (hasVoted) return (
    <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg3)', borderRadius: '8px', border: '1px solid var(--border2)', textAlign: 'center' }}>
      <p style={{ fontSize: '13px', color: 'var(--gold-lt)', fontWeight: 'bold' }}>⚖️ Position Staked</p>
      <p style={{ fontSize: '11px', color: 'var(--text3)' }}>Your intellectual skin is now in the game.</p>
    </div>
  );

  return (
    <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(201,150,10,0.05)', border: '1px solid var(--gold-dim)', borderRadius: '12px' }}>
      <h3 style={{ fontSize: '12px', color: 'var(--gold-lt)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', fontWeight: 'bold' }}>
        Take an Intellectual Position
      </h3>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setPosition('agree')}
          style={{
            flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border2)',
            background: position === 'agree' ? 'var(--gold-dim)' : 'var(--bg3)',
            color: position === 'agree' ? 'var(--gold-lt)' : 'var(--text2)',
            fontWeight: 'bold', cursor: 'pointer'
          }}
        >
          ✅ Agree
        </button>
        <button
          onClick={() => setPosition('disagree')}
          style={{
            flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border2)',
            background: position === 'disagree' ? 'var(--orange-dim)' : 'var(--bg3)',
            color: position === 'disagree' ? 'var(--orange-lt)' : 'var(--text2)',
            fontWeight: 'bold', cursor: 'pointer'
          }}
        >
          ❌ Disagree
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '8px' }}>
           <span>Confidence Level</span>
           <span style={{ color: 'var(--gold-lt)' }}>{confidence}/5</span>
        </div>
        <input
          type="range" min="1" max="5" step="1"
          value={confidence}
          onChange={(e) => setConfidence(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--gold)' }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!position || isSubmitting}
        style={{
          width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
          background: 'var(--gold)', color: 'var(--bg)', fontWeight: 'bold',
          cursor: 'pointer', opacity: (!position || isSubmitting) ? 0.5 : 1
        }}
      >
        {isSubmitting ? 'Staking...' : 'Stake Intellectual Position'}
      </button>
    </div>
  );
}
