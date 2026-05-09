"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import NodeCard from '../nodes/NodeCard';

export default function InfiniteFeed({ initialNodes, filterType }: { initialNodes: any[], filterType: string }) {
  const [nodes, setNodes] = useState(initialNodes);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialNodes.length === 10); // Assume 10 is the page size
  const observerTarget = useRef(null);
  
  const supabase = createClient();

  const loadMoreNodes = useCallback(async () => {
    if (loading || !hasMore || nodes.length === 0) return;
    setLoading(true);

    try {
      const lastNode = nodes[nodes.length - 1];
      const cursor = lastNode.created_at;

      let query = supabase
        .from('nodes')
        .select(`
          *,
          author:profiles(*),
          tags:node_tags(tag:tags(name)),
          node_reactions(id)
        `)
        .is('deleted_at', null)
        .eq('visibility', 'public');

      if (filterType === 'All Pulse') {
        query = query.lt('created_at', cursor).order('created_at', { ascending: false });
      } else if (filterType === 'Top Consensus') {
        // Mocking trending by longevity score, cursor needs to handle ties or just fallback to created_at
        // For simplicity in v1, we just paginate by created_at if it's consensus too, or use offset
        // Cursor on score requires (score < last_score OR (score = last_score AND id < last_id))
        query = query.lt('longevity_score', lastNode.longevity_score || 0).order('longevity_score', { ascending: false });
      }

      const { data, error } = await query.limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        setNodes(prev => [...prev, ...data]);
        if (data.length < 10) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more nodes:", err);
    } finally {
      setLoading(false);
    }
  }, [nodes, loading, hasMore, filterType]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMoreNodes();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMoreNodes]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {nodes.map((node: any) => (
        <NodeCard key={node.id} node={node} />
      ))}
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--gold-dim)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Loading more nodes...
        </div>
      )}

      {!loading && hasMore && (
        <div ref={observerTarget} style={{ height: '20px' }} />
      )}

      {!hasMore && nodes.length > 0 && (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          You've reached the edge of the known graph.
        </div>
      )}

      {nodes.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card)', borderRadius: '12px', border: '1px dashed var(--border2)' }}>
           <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontStyle: 'italic', color: 'var(--text3)' }}>
            The pulse is quiet. Publish a node to begin.
          </p>
        </div>
      )}
    </div>
  );
}
