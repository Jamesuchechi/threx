"use client";

import React, { useState, useEffect } from 'react';

export default function SimilarNodes({ nodeId, title }: { nodeId: string, title: string }) {
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSimilar() {
      try {
        // Calling our AI service semantic search
        const response = await fetch('/api/ai/search/semantic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: title,
            limit: 5,
            filters: { id: { "$ne": nodeId } }
          })
        });
        const data = await response.json();
        setSimilar(data);
      } catch (err) {
        console.error("Failed to fetch similar nodes:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSimilar();
  }, [nodeId, title]);

  if (loading) return <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Finding intellectual parallels...</div>;
  if (similar.length === 0) return null;

  return (
    <div style={{ marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
      <h3 style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
        Intellectual Parallels
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {similar.map((node: any) => (
          <a 
            key={node.id} 
            href={`/node/${node.id}`}
            className="match-card"
            style={{ textDecoration: 'none', display: 'block', transition: 'all 0.2s' }}
          >
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>
              {node.metadata?.title || 'Untitled Node'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{node.metadata?.type || 'Node'}</span>
              <span>{Math.round(node.score * 100)}% alignment</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
