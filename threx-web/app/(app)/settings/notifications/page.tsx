"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '../../../../lib/supabase/client';

export default function NotificationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    async function getPrefs() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code === 'PGRST116') {
          // If not exists, insert default
          const { data: newData } = await supabase
            .from('notification_preferences')
            .insert({ user_id: user.id })
            .select()
            .single();
          data = newData;
        }
        setPrefs(data);
      }
      setLoading(false);
    }
    getPrefs();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('notification_preferences')
      .update({
        email_digest_frequency: prefs.email_digest_frequency,
        notify_on_reaction: prefs.notify_on_reaction,
        notify_on_connection: prefs.notify_on_connection,
        notify_on_citation: prefs.notify_on_citation,
        notify_on_match: prefs.notify_on_match,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', prefs.user_id);

    setMessage(error ? error.message : 'Preferences updated successfully.');
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', color: 'var(--gold)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '3px' }}>
        Loading Preferences...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 0' }}>
      <header style={{ marginBottom: '48px' }}>
        <h1 className="auth-title" style={{ fontSize: '36px' }}>Notification Center</h1>
        <p className="auth-subtitle">Manage how you receive intellectual signals</p>
      </header>

      <div className="node-card">
        <h3 style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px', fontWeight: '600' }}>
          In-App Alerts
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { key: 'notify_on_reaction', label: 'Reaction to your nodes', desc: 'When someone builds on or challenges your work' },
            { key: 'notify_on_citation', label: 'Citations', desc: 'When your node is used as a reference in a new claim' },
            { key: 'notify_on_connection', label: 'Connection Requests', desc: 'When someone wants to join your circle' },
            { key: 'notify_on_match', label: 'Intelligence Matches', desc: 'When the agent finds a high-alignment collaborator' }
          ].map(item => (
            <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '600' }}>{item.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{item.desc}</div>
              </div>
              <input 
                type="checkbox" 
                checked={prefs?.[item.key]}
                onChange={e => setPrefs({ ...prefs, [item.key]: e.target.checked })}
                style={{ cursor: 'pointer', accentColor: 'var(--gold)' }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="node-card" style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px', fontWeight: '600' }}>
          Email Digest
        </h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '600' }}>Frequency</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>A summary of your network activity</div>
          </div>
          <select
            value={prefs?.email_digest_frequency}
            onChange={e => setPrefs({ ...prefs, email_digest_frequency: e.target.value })}
            style={{
              background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)',
              padding: '6px 12px', borderRadius: '4px', fontSize: '12px', outline: 'none'
            }}
          >
            <option value="off">Turned Off</option>
            <option value="daily">Daily Briefing</option>
            <option value="weekly">Weekly Synthesis</option>
          </select>
        </div>
      </div>

      {message && (
        <p style={{
          fontSize: '12px',
          color: message.includes('success') ? 'var(--gold)' : 'var(--orange)',
          marginTop: '24px',
          textAlign: 'center'
        }}>
          {message}
        </p>
      )}

      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="nav-cta"
          style={{ padding: '14px 60px' }}
        >
          {saving ? 'Syncing...' : 'Update Preferences'}
        </button>
      </div>
    </div>
  );
}
