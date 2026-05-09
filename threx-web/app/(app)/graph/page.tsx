"use client";

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    cytoscape: any;
  }
}

export default function GraphPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  const initGraph = async () => {
    if (!window.cytoscape || !containerRef.current) return;

    try {
      // Fetch entire user graph (mocking for now, would fetch from /api/ai/graph/all)
      const response = await fetch('/api/ai/graph/all');
      const elements = await response.json();

      window.cytoscape({
        container: containerRef.current,
        elements: elements,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': 'var(--gold-dim)',
              'label': 'data(label)',
              'color': '#fff',
              'font-size': '10px',
              'width': '20px',
              'height': '20px'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 1,
              'line-color': 'var(--border2)',
              'target-arrow-color': 'var(--border2)',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier'
            }
          }
        ],
        layout: {
          name: 'cose',
          animate: true
        }
      });
    } catch (err) {
      console.error("Graph initialization failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 100px)', position: 'relative' }}>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.23.0/cytoscape.min.js"
        onLoad={initGraph}
      />
      
      <div style={{ padding: '32px' }}>
        <h1 className="auth-title" style={{ fontSize: '32px', marginBottom: '8px' }}>Knowledge Graph</h1>
        <p className="auth-subtitle">Visualizing the intellectual network</p>
      </div>

      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '100%', background: 'var(--bg)' }} 
      />

      {loading && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--gold-dim)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Visualizing formal logic nodes...
        </div>
      )}
    </div>
  );
}
