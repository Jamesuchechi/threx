"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import InfiniteFeed from './InfiniteFeed';

export default function FeedContainer() {
  const [activeFilter, setActiveFilter] = useState('All Pulse');
  const [initialNodes, setInitialNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = ['All Pulse', 'Smart Discovery', 'Top Consensus', 'My Network', 'Neuroscience', 'AI Safety'];

  useEffect(() => {
    async function fetchInitial() {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (activeFilter === 'Smart Discovery' && user) {
        try {
          const res = await fetch(`/api/ai/search/smart-feed/${user.id}`);
          const results = await res.json();
          // Results are SearchResults { id, score, metadata }
          const nodes = results.map((r: any) => ({
            ...r.metadata,
            id: r.id,
            match_score: r.score,
            // Mocking author/tags if not in metadata, but they should be
          }));
          setInitialNodes(nodes);
          setLoading(false);
          return;
        } catch (err) {
          console.error("Smart feed error:", err);
        }
      }
      
      let query = supabase
        .from('nodes')
        .select(`
          *,
          author:profiles(*),
          tags:node_tags(tag:tags(name)),
          node_reactions(id)
        `)
        .is('deleted_at', null)
        .eq('visibility', 'public')
        .limit(10);

      if (activeFilter === 'All Pulse') {
        query = query.order('created_at', { ascending: false });
      } else if (activeFilter === 'Top Consensus') {
        query = query.order('longevity_score', { ascending: false });
      } else if (activeFilter === 'My Network') {
        // Mocking for now: maybe just order by created_at, but we'd join followers later
        query = query.order('created_at', { ascending: false });
      } else {
        // Domain filtered (e.g. Neuroscience)
        // For Supabase, filtering by a joined table tag name is tricky in a single RPC without a view.
        // We will just fetch all and filter client-side for the MVP, or use an RPC.
        // For now, let's just use chronological order.
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Feed error:", error);
      } else {
        // Simple domain filter logic (client side for MVP)
        if (activeFilter !== 'All Pulse' && activeFilter !== 'Top Consensus' && activeFilter !== 'My Network') {
            const filtered = data?.filter(n => n.tags?.some((t: any) => t.tag.name.toLowerCase() === activeFilter.toLowerCase())) || [];
            setInitialNodes(filtered);
        } else {
            setInitialNodes(data || []);
        }
      }
      setLoading(false);
    }

    fetchInitial();
  }, [activeFilter]);

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        {filters.map((filter) => (
          <span 
            key={filter} 
            onClick={() => setActiveFilter(filter)}
            style={{ 
              padding: '6px 14px', 
              fontSize: '11px', 
              borderRadius: '20px', 
              border: '1px solid var(--border2)', 
              color: activeFilter === filter ? 'var(--gold-lt)' : 'var(--text2)', 
              background: activeFilter === filter ? 'var(--card2)' : 'transparent',
              borderColor: activeFilter === filter ? 'var(--gold-dim)' : 'var(--border2)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              fontWeight: activeFilter === filter ? '600' : '400'
            }}
          >
            {filter}
          </span>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gold-dim)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Tuning into the graph...
        </div>
      ) : (
        <InfiniteFeed key={activeFilter} initialNodes={initialNodes} filterType={activeFilter} />
      )}
    </div>
  );
}
