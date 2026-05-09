"use client";

import React, { useState, useEffect } from 'react';

export default function GraphConnections({ nodeId }: { nodeId: string }) {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConnections() {
      try {
        const response = await fetch(`/api/ai/graph/connections/${nodeId}`);
        if (!response.ok) {
           // Handle 401, 404, 500 etc.
           if (response.status === 401) {
             console.warn("User is unauthorized for graph connections");
           }
           setConnections([]);
           return;
        }
        
        const data = await response.json();
        
        if (data && !data.error) {
          setConnections(Array.isArray(data) ? data : []);
        } else {
          console.warn("AI Service returned error or invalid data:", data?.error || data);
          setConnections([]);
        }
      } catch (err) {
        console.error("Failed to fetch graph connections:", err);
        setConnections([]);
      } finally {
        setLoading(false);
      }
    }
    fetchConnections();
  }, [nodeId]);

  if (loading) return <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Mapping intellectual network...</div>;
  if (connections.length === 0) return null;

  return (
    <div style={{ marginTop: '32px', background: 'rgba(201,150,10,0.03)', border: '1px solid var(--border2)', borderRadius: '12px', padding: '24px' }}>
      <h3 style={{ fontSize: '12px', color: 'var(--gold-lt)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', fontWeight: '600' }}>
        AI Graph Connections
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {connections.map((conn, i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
             <div style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--card2)', border: '1px solid var(--gold-dim)', fontSize: '10px', color: 'var(--gold-lt)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                {conn.type}
             </div>
             <div style={{ flex: 1 }}>
                <a href={`/node/${conn.id}`} style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', textDecoration: 'none', display: 'block', marginBottom: '4px' }}>
                  {conn.title}
                </a>
                <p style={{ fontSize: '12px', color: 'var(--text2)', fontStyle: 'italic', borderLeft: '2px solid var(--gold-dim)', paddingLeft: '12px' }}>
                  {conn.reason}
                </p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
