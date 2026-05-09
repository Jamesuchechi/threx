"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/onboarding');
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('A new verification code has been sent.');
    }
    setResending(false);
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Verify Your Mind</h2>
      <p className="auth-subtitle">We've sent a 6-digit code to <span>{email}</span></p>

      <form onSubmit={handleVerify}>
        <div className="form-group">
          <label className="form-label">Verification Code</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value.toUpperCase())}
            className="form-input"
            placeholder="X X X X X X"
            maxLength={6}
            style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
            required
          />
        </div>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-message">{message}</p>}

        <button
          type="submit"
          disabled={loading || token.length < 6}
          className="nav-cta"
          style={{ width: '100%', marginTop: '24px', padding: '16px' }}
        >
          {loading ? 'Verifying...' : 'Complete Registration'}
        </button>
      </form>

      <div className="auth-footer">
        <p style={{ marginBottom: '12px' }}>
          Didn't receive the email? 
        </p>
        <button 
          onClick={handleResend} 
          disabled={resending}
          className="auth-link"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}
        >
          {resending ? 'Resending...' : 'Request a new code'}
        </button>
        <div style={{ marginTop: '24px', opacity: 0.5, fontSize: '10px' }}>
          Or simply click the link in the email we sent you.
        </div>
      </div>
    </div>
  );
}
