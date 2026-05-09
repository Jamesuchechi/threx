"use client";

import React, { useState } from 'react';
import { createClient } from '../../../../../lib/supabase/client';

export default function EditNodeForm({ node, tags }: { node: any, tags: string[] }) {
  const [title, setTitle] = useState(node.title);
  const [content, setContent] = useState(node.content);
  const [visibility, setVisibility] = useState(node.visibility);
  const [tagsInput, setTagsInput] = useState(tags.join(', '));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const supabase = createClient();

  const handleUpdate = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);

    try {
      // Postgres Trigger automatically handles versioning!
      const { error } = await supabase
        .from('nodes')
        .update({
          title,
          content,
          visibility
        })
        .eq('id', node.id);

      if (error) throw error;
      
      // Update tags
      await supabase.from('node_tags').delete().eq('node_id', node.id);
      
      const parsedTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      for (const tagName of parsedTags) {
        const { data: tag } = await supabase.from('tags').upsert({ name: tagName }, { onConflict: 'name' }).select().single();
        if (tag) {
          await supabase.from('node_tags').insert({ node_id: node.id, tag_id: tag.id });
        }
      }

      window.location.href = `/node/${node.id}`;
    } catch (err) {
      console.error(err);
      alert('Failed to update node.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this node? It will be soft-deleted and unlisted.')) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('nodes')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', node.id);

      if (error) throw error;
      window.location.href = '/nodes/my';
    } catch (err) {
      console.error(err);
      alert('Failed to delete node.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="node-card">
      <div style={{ marginBottom: '24px' }}>
        <label className="form-label">Title</label>
        <input 
          type="text" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          className="form-input" 
          style={{ fontFamily: 'Cinzel, serif', fontSize: '20px', fontWeight: 'bold' }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label className="form-label">Content (Markdown)</label>
        <textarea 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          className="form-input" 
          style={{ minHeight: '300px', lineHeight: 1.6 }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div>
          <label className="form-label">Visibility</label>
          <select 
            value={visibility} 
            onChange={e => setVisibility(e.target.value)} 
            className="form-input"
          >
            <option value="public">Public</option>
            <option value="circle">My Circles</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div>
          <label className="form-label">Tags</label>
          <input 
            type="text" 
            value={tagsInput} 
            onChange={e => setTagsInput(e.target.value)} 
            className="form-input" 
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
        <button 
          onClick={handleDelete} 
          disabled={isDeleting}
          style={{ background: 'transparent', border: '1px solid var(--orange)', color: 'var(--orange-lt)', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}
        >
          {isDeleting ? 'Deleting...' : 'Delete Node'}
        </button>

        <div style={{ display: 'flex', gap: '16px' }}>
          <a href={`/node/${node.id}`} style={{ textDecoration: 'none', color: 'var(--text3)', fontSize: '12px', padding: '10px 24px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center' }}>
            Cancel
          </a>
          <button 
            onClick={handleUpdate} 
            disabled={isSubmitting}
            className="nav-cta"
            style={{ padding: '10px 32px' }}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
