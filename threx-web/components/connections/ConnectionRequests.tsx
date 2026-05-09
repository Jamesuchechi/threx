"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function ConnectionRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchRequests() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('connection_requests')
        .select('*, sender:profiles!sender_id(*)')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');
      
      setRequests(data || []);
      setLoading(false);
    }
    fetchRequests();
  }, []);

  const handleUpdate = async (requestId: string, status: 'accepted' | 'declined') => {
    const request = requests.find(r => r.id === requestId);
    
    await supabase
      .from('connection_requests')
      .update({ status })
      .eq('id', requestId);

    if (status === 'accepted') {
      // Create mutual connection
      await supabase.from('connections').insert([
        { user_a_id: request.sender_id, user_b_id: request.receiver_id }
      ]);
    }

    setRequests(prev => prev.filter(r => r.id !== requestId));
  };

  if (loading) return null;
  if (requests.length === 0) return null;

  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ fontSize: '10px', color: 'var(--gold-lt)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', fontWeight: 'bold' }}>
        Pending Connection Requests
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {requests.map(req => (
          <div key={req.id} className="node-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg3)', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  {req.sender?.username?.[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{req.sender?.full_name || req.sender?.username}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>@{req.sender?.username} • {Math.round(req.match_score * 100)}% Match</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleUpdate(req.id, 'declined')} style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', cursor: 'pointer' }}>Decline</button>
                <button onClick={() => handleUpdate(req.id, 'accepted')} style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '4px', border: 'none', background: 'var(--gold)', color: 'var(--bg)', fontWeight: 'bold', cursor: 'pointer' }}>Accept</button>
              </div>
            </div>
            <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text2)', fontStyle: 'italic', borderLeft: '2px solid var(--gold-dim)', paddingLeft: '12px' }}>
              "{req.match_reason}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
