import React from 'react';
import { createClient } from '../../../../lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const supabase = await createClient();
  const { username } = await params;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*, social_links(*)')
    .eq('username', username)
    .single();

  if (error || !profile) {
    return notFound();
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 0' }}>

      {/* Profile Header Card */}
      <div className="node-card" style={{ marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        {/* Gold top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, var(--gold), transparent)' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '28px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: '88px', height: '88px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--gold-dim), var(--orange))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Cinzel, serif', fontSize: '32px', fontWeight: '700',
            color: 'var(--bg)', border: '2px solid var(--border2)',
            overflow: 'hidden'
          }}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              profile.username[0].toUpperCase()
            )}
          </div>

          {/* Identity */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '28px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' }}>
              {profile.full_name || profile.username}
            </h1>
            <div style={{ fontSize: '11px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '16px' }}>
              @{profile.username}
            </div>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', fontStyle: 'italic', color: 'var(--text2)', lineHeight: 1.6, maxWidth: '480px' }}>
              "{profile.bio || 'An explorer of the intellectual frontier.'}"
            </p>

            {/* Domain Tags */}
            {profile.domain_tags && profile.domain_tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px' }}>
                {profile.domain_tags.map((tag: string) => (
                  <span key={tag} style={{
                    padding: '4px 12px', fontSize: '10px', borderRadius: '20px',
                    background: 'var(--bg3)', border: '1px solid var(--border2)',
                    color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '1px'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Reputation Score */}
          <div style={{
            background: 'var(--bg3)', border: '1px solid var(--border2)',
            borderRadius: '12px', padding: '24px 32px', textAlign: 'center', minWidth: '140px'
          }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '36px', fontWeight: '700', color: 'var(--gold-lt)', lineHeight: 1 }}>
              {profile.reputation_score || 0}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '8px' }}>
              Reputation Score
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' }}>

        {/* Left: Main Content */}
        <div>
          {/* Cognitive Profile */}
          <div className="node-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '13px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '2px', borderLeft: '2px solid var(--gold)', paddingLeft: '12px', marginBottom: '20px' }}>
              Cognitive Profile
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg3)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: '12px', height: '12px', background: 'var(--gold)', transform: 'rotate(45deg)' }} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>
                  {profile.thinking_style || 'Generalist'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                  Primary cognitive architecture as inferred by THREX-AI
                </div>
              </div>
            </div>
          </div>

          {/* Intellectual Contributions */}
          <div className="node-card">
            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '13px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '2px', borderLeft: '2px solid var(--gold)', paddingLeft: '12px', marginBottom: '20px' }}>
              Intellectual Contributions
            </h3>
            <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg3)', borderRadius: '8px', border: '1px dashed var(--border2)' }}>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', fontStyle: 'italic', color: 'var(--text3)' }}>
                No nodes published yet.
              </p>
              <p style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                First thoughts are forming...
              </p>
            </div>
          </div>
        </div>

        {/* Right: Metadata & Connections */}
        <aside>
          {/* Connections */}
          <div className="node-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600', marginBottom: '16px' }}>
              Connections
            </h3>
            {profile.social_links && profile.social_links.length > 0 ? (
              profile.social_links.map((link: any) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: '8px', marginBottom: '8px', textDecoration: 'none',
                    transition: 'border-color 0.2s'
                  }}
                >
                  <span style={{ fontSize: '11px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {link.platform}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--gold-dim)' }}>↗</span>
                </a>
              ))
            ) : (
              <p style={{ fontSize: '11px', color: 'var(--text3)', fontStyle: 'italic' }}>
                No external links verified.
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="node-card">
            <h3 style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600', marginBottom: '16px' }}>
              Metadata
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text3)' }}>Member Since</span>
                <span style={{ color: 'var(--text2)' }}>{new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
              </div>
              <div style={{ height: '1px', background: 'var(--border)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text3)' }}>Location</span>
                <span style={{ color: 'var(--text2)' }}>{profile.location || 'Distributed'}</span>
              </div>
              {profile.website && (
                <>
                  <div style={{ height: '1px', background: 'var(--border)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ color: 'var(--text3)' }}>Portfolio</span>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
                      Visit →
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
