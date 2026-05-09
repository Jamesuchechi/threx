"use client";

import React, { useState } from 'react';
import { createClient } from '../../../lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = '/feed';
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Welcome Back</h2>
      <p className="auth-subtitle">Continue your intellectual journey</p>

      <form onSubmit={handleLogin}>
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

        <button
          type="submit"
          disabled={loading}
          className="nav-cta"
          style={{ width: '100%', marginTop: '24px', padding: '16px' }}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Don't have an account? <a href="/signup" className="auth-link">Request Access</a>
        </p>
      </div>
    </div>
  );
}
