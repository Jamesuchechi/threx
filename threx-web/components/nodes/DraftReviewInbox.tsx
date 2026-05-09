"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

export default function DraftReviewInbox() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDraft, setSelectedDraft] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchDrafts() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('nodes')
        .select('*')
        .eq('author_id', user.id)
        .eq('is_agent_draft', true)
        .order('created_at', { ascending: false });
      
      setDrafts(data || []);
      setLoading(false);
    }
    fetchDrafts();
  }, []);

  const handleApprove = async (id: string) => {
    await supabase.from('nodes').update({ is_agent_draft: false }).eq('id', id);
    setDrafts(prev => prev.filter(d => d.id !== id));
    setSelectedDraft(null);
  };

  if (loading || drafts.length === 0) return null;

  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ 
        background: 'linear-gradient(90deg, rgba(201,150,10,0.1), transparent)', 
        border: '1px solid var(--gold-dim)', borderRadius: '12px', padding: '20px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <h3 style={{ fontSize: '14px', color: 'var(--gold-lt)', fontWeight: 'bold', marginBottom: '4px' }}>
             🕵️ AI Drafts Pending Review
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text3)' }}>You have {drafts.length} intellectual drafts synthesized from your voice notes.</p>
        </div>
        <button 
          onClick={() => setSelectedDraft(drafts[0])}
          className="nav-cta" style={{ padding: '10px 24px', fontSize: '12px' }}
        >
          Review Now
        </button>
      </div>

      <AnimatePresence>
        {selectedDraft && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="node-card"
              style={{ maxWidth: '1000px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '40px' }}
            >
               <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                  <div>
                    <h2 style={{ fontSize: '24px', fontFamily: 'Cinzel, serif' }}>Review Intelligence Draft</h2>
                    <p style={{ fontSize: '12px', color: 'var(--text3)' }}>Confirm AI synthesis of your voice observation</p>
                  </div>
                  <button onClick={() => setSelectedDraft(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text3)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
               </header>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  <div>
                    <label style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--gold)', letterSpacing: '2px', display: 'block', marginBottom: '12px' }}>Original Synthesis</label>
                    <div style={{ background: 'var(--bg3)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', lineHeight: '1.6', color: 'var(--text2)' }}>
                       {selectedDraft.content}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--gold)', letterSpacing: '2px', display: 'block', marginBottom: '12px' }}>Structure & Metadata</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                       <div>
                          <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '4px' }}>Title</div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{selectedDraft.title}</div>
                       </div>
                       <div>
                          <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '4px' }}>Type</div>
                          <span className="node-type-badge">{selectedDraft.type}</span>
                       </div>
                    </div>
                  </div>
               </div>

               <div style={{ marginTop: '40px', display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setSelectedDraft(null)} className="btn-secondary">Keep in Drafts</button>
                  <button 
                    onClick={() => handleApprove(selectedDraft.id)}
                    className="nav-cta" style={{ padding: '12px 40px' }}
                  >
                    Approve & Publish
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
