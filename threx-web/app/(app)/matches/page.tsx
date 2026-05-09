"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

export default function MatchesPage() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    async function fetchMatches() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const response = await fetch(`/api/ai/matches/suggest/${user.id}`);
        const data = await response.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Failed to fetch matches:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, []);

  const handleAction = async (action: 'connect' | 'pass') => {
    const currentMatch = suggestions[currentIndex];
    if (!currentMatch) return;

    if (action === 'connect') {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('connection_requests').insert({
        sender_id: user?.id,
        receiver_id: currentMatch.user_id,
        match_reason: currentMatch.reason,
        match_score: currentMatch.match_score
      });
      alert("Intellectual connection request sent!");
    }

    setCurrentIndex(prev => prev + 1);
  };

  if (loading) return <div style={{ padding: '40px', color: 'var(--text3)' }}>Synthesizing intellectual parallels...</div>;
  
  const current = suggestions[currentIndex];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
      <header style={{ marginBottom: '48px' }}>
        <h1 className="auth-title" style={{ fontSize: '32px', marginBottom: '8px' }}>Intellectual Matches</h1>
        <p className="auth-subtitle">AI-curated connections based on your knowledge graph</p>
      </header>

      <div style={{ position: 'relative', height: '400px' }}>
        <AnimatePresence mode="wait">
          {current ? (
            <motion.div
              key={current.user_id}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.1, opacity: 0, x: 200 }}
              className="node-card"
              style={{
                padding: '40px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid var(--gold-dim)'
              }}
            >
               <div style={{
                  width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 24px',
                  background: 'var(--bg3)', border: '2px solid var(--gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '32px', fontFamily: 'Cinzel, serif'
               }}>
                  {current.profile?.username?.[0].toUpperCase()}
               </div>
               <h2 style={{ fontSize: '24px', marginBottom: '4px' }}>{current.profile?.full_name || current.profile?.username}</h2>
               <div style={{ fontSize: '11px', color: 'var(--gold-lt)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px' }}>
                  {Math.round(current.match_score * 100)}% Intellectual Alignment
               </div>
               
               <div style={{ background: 'var(--bg3)', padding: '20px', borderRadius: '8px', border: '1px dashed var(--border2)', fontStyle: 'italic', color: 'var(--text2)', fontSize: '14px', lineHeight: '1.6' }}>
                  "{current.reason}"
               </div>

               <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
                  <button onClick={() => handleAction('pass')} className="btn-secondary" style={{ padding: '12px 32px' }}>Pass</button>
                  <button onClick={() => handleAction('connect')} className="nav-cta" style={{ padding: '12px 32px' }}>Connect</button>
               </div>
            </motion.div>
          ) : (
            <div style={{ padding: '40px', color: 'var(--text3)' }}>No more matches for today. Check back as the graph grows.</div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
