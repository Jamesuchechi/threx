"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '../../../../lib/supabase/client';

export default function ProfileEditPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    }
    getProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
      })
      .eq('id', profile.id);

    setMessage(error ? error.message : 'Identity updated successfully.');
    setUpdating(false);
  };

  if (loading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', color: 'var(--gold)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '3px' }}>
        Loading Dossier...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 0' }}>

      {/* Page Header */}
      <header style={{ marginBottom: '48px' }}>
        <h1 className="auth-title" style={{ fontSize: '36px' }}>Edit Identity</h1>
        <p className="auth-subtitle">Refine your presentation to the network</p>
      </header>

      {/* Avatar Section */}
      <div className="node-card" style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--gold-dim), var(--orange))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Cinzel, serif', fontSize: '28px', fontWeight: '700',
          color: 'var(--bg)', flexShrink: 0, border: '2px solid var(--border2)'
        }}>
          {profile?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>
            @{profile?.username}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            Member since {new Date(profile?.created_at || Date.now()).getFullYear()}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleUpdate}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={profile?.full_name || ''}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="form-input"
              placeholder="Your full name"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Location</label>
            <input
              type="text"
              value={profile?.location || ''}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              className="form-input"
              placeholder="City, Country"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea
            value={profile?.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="form-input"
            placeholder="What drives your intellectual curiosity?"
            rows={4}
            style={{ resize: 'vertical', fontFamily: 'DM Sans, sans-serif' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Website / Portfolio</label>
          <input
            type="url"
            value={profile?.website || ''}
            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
            className="form-input"
            placeholder="https://yourportfolio.com"
          />
        </div>

        {message && (
          <p style={{
            fontSize: '12px',
            color: message.includes('success') ? 'var(--gold)' : 'var(--orange)',
            marginBottom: '24px'
          }}>
            {message}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
          <button
            type="submit"
            disabled={updating}
            className="nav-cta"
            style={{ padding: '14px 40px' }}
          >
            {updating ? 'Persisting...' : 'Save Changes'}
          </button>
          <a href={`/u/${profile?.username}`} className="auth-link" style={{ fontSize: '12px' }}>
            View Public Profile →
          </a>
        </div>
      </form>
    </div>
  );
}
