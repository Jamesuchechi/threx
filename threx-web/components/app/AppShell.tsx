"use client";

import React, { useState } from 'react';
import NotificationCenter from '../notifications/NotificationCenter';

interface AppShellProps {
  children: React.ReactNode;
  profile: any;
}

export default function AppShell({ children, profile }: AppShellProps) {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  return (
    <div className="wf-shell">
      {/* ── TOP NAVIGATION BAR ── */}
      <header className="app-nav" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '0 20px', height: '56px' }}>

        {/* Zone 1 — Left: Collapse toggle + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <button
            onClick={() => setLeftOpen(o => !o)}
            title={leftOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            style={{
              background: 'none', border: '1px solid var(--border2)', borderRadius: '6px',
              padding: '5px 9px', cursor: 'pointer', color: 'var(--text3)',
              fontSize: '11px', transition: 'all 0.2s', lineHeight: 1, flexShrink: 0,
            }}
          >
            {leftOpen ? '◀' : '▶'}
          </button>
          <a href="/" className="nav-logo" style={{ fontSize: '16px', letterSpacing: '3px', flexShrink: 0 }}>THREX</a>
        </div>

        {/* Zone 2 — Center: Nav Tabs (always centred) */}
        <div className="nav-tabs">
          <a href="/feed" className="nav-tab active">Pulse</a>
          <a href="/graph" className="nav-tab">Graph</a>
          <a href="/circles" className="nav-tab">Circles</a>
          <a href="/synthesis" className="nav-tab">Synthesis</a>
        </div>

        {/* Zone 3 — Right: Agent toggle + Notif + Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end', minWidth: 0 }}>
          <button
            onClick={() => setRightOpen(o => !o)}
            title={rightOpen ? 'Hide Intelligence Panel' : 'Show Intelligence Panel'}
            style={{
              background: rightOpen ? 'rgba(201,150,10,0.12)' : 'var(--bg3)',
              border: '1px solid var(--border2)', borderRadius: '8px',
              padding: '5px 12px', cursor: 'pointer',
              color: rightOpen ? 'var(--gold-lt)' : 'var(--text3)',
              fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase',
              transition: 'all 0.2s', fontFamily: 'DM Sans, sans-serif', flexShrink: 0,
            }}
          >
            {rightOpen ? '◀ Agent' : 'Agent ▶'}
          </button>

          <NotificationCenter userId={profile?.id} />

          <a
            href="/settings/profile"
            style={{
              textDecoration: 'none', flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'var(--bg3)', border: '1px solid var(--border2)',
              borderRadius: '20px', padding: '4px 12px 4px 4px',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-dim)';
              (e.currentTarget as HTMLElement).style.background = 'var(--card2)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)';
              (e.currentTarget as HTMLElement).style.background = 'var(--bg3)';
            }}
          >
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--gold-dim), var(--orange))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '700', color: 'var(--bg)',
              fontFamily: 'Cinzel, serif', flexShrink: 0,
            }}>
              {profile?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <span style={{
              fontSize: '11px', color: 'var(--text2)', fontWeight: '500',
              maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              @{profile?.username || 'Profile'}
            </span>
          </a>
        </div>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `${leftOpen ? '240px' : '0px'} 1fr ${rightOpen ? '300px' : '0px'}`,
          transition: 'grid-template-columns 0.3s ease',
          minHeight: 'calc(100vh - 56px)',
          overflow: 'hidden',
        }}
      >
        {/* ── LEFT SIDEBAR ── */}
        <aside
          style={{
            background: 'var(--bg2)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 56px)',
            position: 'sticky',
            top: '56px',
            overflow: 'hidden',
            transition: 'opacity 0.2s ease',
            opacity: leftOpen ? 1 : 0,
            pointerEvents: leftOpen ? 'auto' : 'none',
          }}
        >
          <nav style={{ padding: '24px 0' }}>
            <a href="/feed" className="menu-item active"><i>🏠</i> Home</a>
            <a href="/nodes/my" className="menu-item"><i>📜</i> My Nodes</a>
            <a href="/challenges" className="menu-item"><i>🏆</i> Challenges</a>
            <a href="/bookmarks" className="menu-item"><i>🔖</i> Library</a>
            <a href={`/u/${profile?.username}`} className="menu-item"><i>👤</i> Public Profile</a>
          </nav>

          <div className="sidebar-section">Your Reputation</div>
          <div style={{ margin: '8px 24px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '8px' }}>Global Standing</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--gold-lt)', marginBottom: '8px' }}>
              {profile?.reputation_score || 0}
            </div>
            <div style={{ height: '3px', background: 'var(--border2)', borderRadius: '2px' }}>
              <div style={{ height: '100%', width: '20%', background: 'var(--gold)', borderRadius: '2px' }} />
            </div>
          </div>

          <div style={{ marginTop: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <a href="/settings/profile" className="menu-item"><i>⚙️</i> Settings</a>
            <form action="/auth/signout" method="post">
              <button className="menu-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
                <i>🚪</i> Exit Network
              </button>
            </form>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="feed-center" style={{ overflowY: 'auto', height: 'calc(100vh - 56px)' }}>
          {children}
        </main>

        {/* ── RIGHT SIDEBAR ── */}
        <aside
          style={{
            background: 'var(--bg2)',
            borderLeft: '1px solid var(--border)',
            padding: rightOpen ? '32px 20px' : '0',
            height: 'calc(100vh - 56px)',
            position: 'sticky',
            top: '56px',
            overflowY: 'auto',
            overflowX: 'hidden',
            transition: 'opacity 0.2s ease, padding 0.3s ease',
            opacity: rightOpen ? 1 : 0,
            pointerEvents: rightOpen ? 'auto' : 'none',
          }}
        >
          <div className="panel-title">Intelligence Agent</div>
          <div className="agent-status" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--amber)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '12px', fontWeight: '600' }}>Agent Active</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text2)', background: 'var(--bg3)', padding: '8px', borderRadius: '6px' }}>
              Synthesizing new nodes in "AI Safety"...
            </div>
          </div>

          <div className="panel-title">Recommended Collaborators</div>
          {[1, 2].map(i => (
            <div key={i} className="match-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>U</div>
                <span style={{ fontSize: '12px', fontWeight: '500' }}>Thinker_{i}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text2)', borderLeft: '2px solid var(--gold-dim)', paddingLeft: '8px', marginBottom: '10px' }}>
                Matches your recent query on "Formal Verification".
              </div>
              <button style={{ width: '100%', padding: '6px', fontSize: '11px', borderRadius: '6px', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--gold-lt)', cursor: 'pointer' }}>
                Connect
              </button>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
