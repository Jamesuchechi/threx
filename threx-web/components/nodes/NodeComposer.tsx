"use client";

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import CoThinkPanel from './CoThinkPanel';
import VoiceRecorder from './VoiceRecorder';

const NODE_TYPES = ['claim', 'question', 'hypothesis', 'essay', 'summary', 'data', 'project'] as const;
type NodeType = typeof NODE_TYPES[number];

export default function NodeComposer({ profile }: { profile: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [nodeType, setNodeType] = useState<NodeType>('claim');
  const [visibility, setVisibility] = useState<'public' | 'circle' | 'private'>('public');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();
  const [isAgentDraft, setIsAgentDraft] = useState(false);
  const [isStakedClaim, setIsStakedClaim] = useState(false);

  const handleVoiceDraft = (draft: any) => {
    setTitle(draft.title);
    setContent(draft.content);
    setNodeType(draft.node_type as NodeType);
    setTags(draft.tags.join(', '));
    setIsExpanded(true);
    setIsAgentDraft(true);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);

    const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    const finalTitle = title.trim() || content.split(' ').slice(0, 5).join(' ') + '...';

    try {
      // 1. Insert Node
      const { data: node, error: nodeError } = await supabase
        .from('nodes')
        .insert({
          author_id: profile.id,
          title: finalTitle,
          content,
          type: nodeType,
          visibility
        })
        .select()
        .single();

      if (nodeError) throw nodeError;

      // 1b. Insert Claim if toggled
      if (isStakedClaim) {
        await supabase.from('claims').insert({
          node_id: node.id,
          author_id: profile.id
        });
      }

      // 2. Insert Tags
      if (parsedTags.length > 0) {
        for (const tagName of parsedTags) {
          const { data: tag } = await supabase
            .from('tags')
            .upsert({ name: tagName }, { onConflict: 'name' })
            .select()
            .single();
            
          if (tag) {
            await supabase.from('node_tags').insert({
              node_id: node.id,
              tag_id: tag.id
            });
          }
        }
      }

      // Reset
      setContent('');
      setTitle('');
      setTags('');
      setIsExpanded(false);
      window.location.reload();
      
    } catch (error) {
      console.error("Error publishing node:", error);
      alert("Failed to publish node.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="node-card" style={{ marginBottom: '24px', transition: 'all 0.3s ease', cursor: isExpanded ? 'default' : 'text' }} onClick={() => !isExpanded && setIsExpanded(true)}>
      
      {isExpanded && (
        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="compose-avatar" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
            {profile?.username?.[0].toUpperCase() || 'U'}
          </div>
          <input
            type="text"
            placeholder="Title (Optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid var(--border2)',
              color: 'var(--text)', fontSize: '18px', fontWeight: 'bold', fontFamily: 'Cinzel, serif',
              padding: '4px 0', outline: 'none'
            }}
          />
        </div>
      )}

      {!isExpanded && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div className="compose-avatar">
            {profile?.username?.[0].toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, fontSize: '13px', color: 'var(--text3)' }}>
            Share an observation, claim, or hypothesis...
          </div>
          <VoiceRecorder onDraftReady={handleVoiceDraft} />
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flex: isExpanded ? '3' : '1' }}>
          <div style={{ 
            minHeight: isExpanded ? '120px' : '0', 
            display: isExpanded ? 'block' : 'none',
          }}>
            <textarea
              placeholder="What are you thinking? (Markdown supported)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                width: '100%', minHeight: '180px', background: 'transparent', border: 'none',
                color: 'var(--text)', fontSize: '15px', fontFamily: 'DM Sans, sans-serif',
                resize: 'none', outline: 'none', lineHeight: '1.6'
              }}
            />
          </div>
        </div>

        {isExpanded && (
          <div style={{ flex: '1.5', minWidth: '250px' }}>
            <CoThinkPanel content={content} />
          </div>
        )}
      </div>

      {isExpanded && (
        <div style={{ marginTop: '16px', borderTop: '1px solid var(--border2)', paddingTop: '16px' }}>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text3)', letterSpacing: '1px', marginBottom: '8px' }}>Type</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {NODE_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={(e) => { e.stopPropagation(); setNodeType(type); }}
                    style={{
                      padding: '4px 10px', fontSize: '10px', borderRadius: '6px',
                      background: nodeType === type ? 'var(--gold-dim)' : 'var(--bg3)',
                      border: `1px solid ${nodeType === type ? 'var(--gold)' : 'var(--border2)'}`,
                      color: nodeType === type ? 'var(--gold-lt)' : 'var(--text2)',
                      cursor: 'pointer', textTransform: 'capitalize'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text3)', letterSpacing: '1px', marginBottom: '8px' }}>Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                style={{
                  background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)',
                  padding: '4px 8px', borderRadius: '4px', fontSize: '12px', outline: 'none'
                }}
              >
                <option value="public">Public</option>
                <option value="circle">My Circles</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
               <input 
                  type="checkbox" 
                  id="staked" 
                  checked={isStakedClaim} 
                  onChange={(e) => setIsStakedClaim(e.target.checked)}
                  style={{ cursor: 'pointer' }}
               />
               <label htmlFor="staked" style={{ fontSize: '12px', color: 'var(--gold-lt)', fontWeight: 'bold', cursor: 'pointer' }}>
                  Staked Claim ⚖️
               </label>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
             <input
                type="text"
                placeholder="Tags (comma separated)... e.g. neuroscience, AI safety"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                style={{
                  width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)',
                  color: 'var(--text2)', fontSize: '12px', padding: '8px 12px', borderRadius: '4px', outline: 'none'
                }}
              />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
              style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: '12px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
              disabled={isSubmitting || !content.trim()}
              className="nav-cta"
              style={{ padding: '8px 24px', opacity: (isSubmitting || !content.trim()) ? 0.5 : 1, background: 'var(--gold)', color: 'var(--bg)', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Node'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
