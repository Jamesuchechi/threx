"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

type Mode = 'socratic' | 'steelman' | 'evidence' | 'debate';

export default function CoThinkPanel({ content, nodeId }: { content: string, nodeId?: string }) {
  const [mode, setMode] = useState<Mode>('socratic');
  const [response, setResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const supabase = createClient();

  const startThinking = async () => {
    if (!content.trim()) return;
    
    // Abort previous request
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setIsThinking(true);
    setResponse('');

    try {
      const res = await fetch('/api/ai/cothink/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mode }),
        signal: abortControllerRef.current.signal
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') break;
            try {
              const data = JSON.parse(dataStr);
              setResponse(prev => prev + data.content);
            } catch (e) {}
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Co-thinking failed:", err);
      }
    } finally {
      setIsThinking(false);
    }
  };

  const handleSave = async () => {
    if (!nodeId || !response) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('node_debate_history')
        .insert({
          node_id: nodeId,
          mode,
          ai_response: response
        });
      if (error) throw error;
      alert("Added to Debate Trail!");
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '10px', color: 'var(--gold-lt)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
          AI Co-Thinker
        </h4>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['socratic', 'steelman', 'evidence', 'debate'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                fontSize: '9px', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border2)',
                background: mode === m ? 'var(--gold-dim)' : 'transparent',
                color: mode === m ? 'var(--gold-lt)' : 'var(--text3)',
                cursor: 'pointer', textTransform: 'capitalize'
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', fontSize: '12px', color: 'var(--text2)', lineHeight: '1.6', marginBottom: '16px' }}>
        {response || (isThinking ? "Thinking..." : "AI stress-testing your thought...")}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={startThinking}
          disabled={isThinking || !content.trim()}
          style={{
            flex: 2, padding: '8px', borderRadius: '4px', border: 'none',
            background: 'var(--border2)', color: 'var(--text)', fontSize: '11px',
            fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
            opacity: (isThinking || !content.trim()) ? 0.5 : 1
          }}
        >
          {isThinking ? 'Thinking...' : `Trigger ${mode.toUpperCase()} Challenge`}
        </button>

        {response && nodeId && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--gold-dim)',
              background: 'transparent', color: 'var(--gold-lt)', fontSize: '11px',
              fontWeight: 'bold', cursor: 'pointer', opacity: isSaving ? 0.5 : 1
            }}
          >
            {isSaving ? '...' : 'Save Trail'}
          </button>
        )}
      </div>
    </div>
  );
}
