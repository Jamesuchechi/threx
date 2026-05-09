"use client";

import React, { useState } from 'react';
import { createClient } from '../../../lib/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        data: {
          username: username,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = `/verify?email=${encodeURIComponent(email)}`;
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Join the Network</h2>
      <p className="auth-subtitle">Secure your place in the future of thought</p>

      <form onSubmit={handleSignup}>
        <div className="form-group">
          <label className="form-label">Desired Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-input"
            placeholder="archetype"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            placeholder="thinker@threx.app"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            placeholder="••••••••"
            required
          />
        </div>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-message">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="nav-cta"
          style={{ width: '100%', marginTop: '24px', padding: '16px' }}
        >
          {loading ? 'Creating Account...' : 'Request Access'}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Already a member? <a href="/login" className="auth-link">Sign In</a>
        </p>
      </div>
    </div>
  );
}
