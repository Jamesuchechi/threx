"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '../../../../lib/supabase/client';

export default function MyNodesPage() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [view, setView] = useState<'active' | 'trash'>('active');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchNodes();
  }, [view]);

  const fetchNodes = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from('nodes')
      .select('id, title, content, type, visibility, created_at, citation_count, node_reactions(type)')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    if (view === 'active') {
      query = query.is('deleted_at', null);
    } else {
      query = query.not('deleted_at', 'is', null);
    }

    const { data } = await query;
    setNodes(data || []);
    setLoading(false);
  };

  const handleRestore = async (id: string) => {
    await supabase.from('nodes').update({ deleted_at: null }).eq('id', id);
    fetchNodes();
  };

  const handlePermanentDelete = async (id: string) => {
    if (confirm("Permanently delete this node? This cannot be undone.")) {
      await supabase.from('nodes').delete().eq('id', id);
      fetchNodes();
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 0' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '36px', fontWeight: '700', color: 'var(--text)', marginBottom: '8px' }}>
            My Nodes
          </h1>
          <div style={{ display: 'flex', gap: '16px' }}>
             <button 
                onClick={() => setView('active')}
                style={{ background: 'transparent', border: 'none', color: view === 'active' ? 'var(--gold-lt)' : 'var(--text3)', borderBottom: view === 'active' ? '2px solid var(--gold)' : 'none', padding: '8px 0', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
             >
                ACTIVE GRAPH
             </button>
             <button 
                onClick={() => setView('trash')}
                style={{ background: 'transparent', border: 'none', color: view === 'trash' ? 'var(--gold-lt)' : 'var(--text3)', borderBottom: view === 'trash' ? '2px solid var(--gold)' : 'none', padding: '8px 0', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
             >
                TRASH / RECOVERY
             </button>
          </div>
        </div>
        <div style={{ background: 'var(--bg3)', padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--border2)', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontFamily: 'Cinzel, serif', color: 'var(--gold-lt)', fontWeight: '700', lineHeight: 1 }}>
            {nodes.length}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
            {view === 'active' ? 'Active Nodes' : 'Deleted Nodes'}
          </div>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text3)' }}>Loading nodes...</div>
      ) : nodes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card)', borderRadius: '12px', border: '1px dashed var(--border2)' }}>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontStyle: 'italic', color: 'var(--text3)' }}>
            {view === 'active' ? "You haven't contributed to the graph yet." : "Your trash is empty."}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {nodes.map(node => (
            <div key={node.id} className="node-card" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', opacity: view === 'trash' ? 0.7 : 1 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span className="node-type-badge" style={{ marginBottom: 0 }}>{node.type}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
                    {new Date(node.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
                  {node.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {node.content}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px', borderLeft: '1px solid var(--border)', paddingLeft: '24px' }}>
                {view === 'active' ? (
                  <>
                    <div style={{ fontSize: '11px', color: 'var(--text2)' }}>
                      <span style={{ color: 'var(--gold-dim)' }}>{node.node_reactions?.length || 0}</span> Reactions
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', gap: '8px' }}>
                      <a href={`/node/${node.id}`} style={{ fontSize: '11px', color: 'var(--gold)', textDecoration: 'none', background: 'var(--bg3)', padding: '4px 12px', borderRadius: '4px', border: '1px solid var(--border2)' }}>
                        View
                      </a>
                    </div>
                  </>
                ) : (
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button 
                       onClick={() => handleRestore(node.id)}
                       style={{ background: 'var(--green-dim)', color: 'var(--green-lt)', border: '1px solid var(--green-dim)', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                       RESTORE NODE
                    </button>
                    <button 
                       onClick={() => handlePermanentDelete(node.id)}
                       style={{ background: 'transparent', color: 'var(--red-lt)', border: '1px solid var(--red-dim)', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                    >
                       PERMANENT DELETE
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
