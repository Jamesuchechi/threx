import { createClient } from '../../../../lib/supabase/server';
import React from 'react';

export default async function LeaderboardPage({ params }: { params: Promise<{ domain: string }> }) {
  const supabase = await createClient();
  const { domain: rawDomain } = await params;
  const domain = decodeURIComponent(rawDomain);

  const { data: leaders } = await supabase
    .from('reputation_scores')
    .select('*, profiles(*)')
    .eq('domain', domain)
    .order('score', { ascending: false })
    .limit(50);

  return (
    <div style={{ padding: '40px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 className="auth-title" style={{ fontSize: '32px', marginBottom: '8px' }}>
          Intellectual Leaders: {domain}
        </h1>
        <p className="auth-subtitle">Top-ranked authorities based on verified contributions</p>
      </header>

      <div style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border2)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border2)', background: 'var(--bg3)' }}>
              <th style={{ padding: '16px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text3)' }}>Rank</th>
              <th style={{ padding: '16px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text3)' }}>Expert</th>
              <th style={{ padding: '16px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text3)', textAlign: 'right' }}>Reputation Score</th>
            </tr>
          </thead>
          <tbody>
            {leaders?.map((leader, i) => (
              <tr key={leader.user_id} style={{ borderBottom: '1px solid var(--border2)' }}>
                <td style={{ padding: '16px', fontSize: '18px', fontWeight: 'bold', color: 'var(--gold-lt)' }}>
                  #{i + 1}
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', border: '1px solid var(--gold-dim)' }}>
                      {leader.profiles?.username?.[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{leader.profiles?.full_name || leader.profiles?.username}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text3)' }}>@{leader.profiles?.username}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'right', fontSize: '18px', fontWeight: 'bold', fontFamily: 'Cinzel, serif' }}>
                  {leader.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
