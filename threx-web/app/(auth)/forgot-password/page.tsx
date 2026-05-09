"use client";

import React, { useState } from 'react';
import { createClient } from '../../../lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Recovery instructions sent to your email.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#0C0900] border border-[#1E1500] p-10 rounded-sm shadow-2xl relative">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-right from-[#C8920A] to-transparent" />
      
      <h2 className="font-['Cinzel'] text-2xl font-semibold text-[#F5E6C0] mb-2 tracking-tight">Recover Access</h2>
      <p className="font-['Cormorant_Garamond'] text-lg text-[#A8885A] mb-8 italic">Restore your connection to the network</p>

      <form onSubmit={handleReset} className="space-y-6">
        <div>
          <label className="block text-[10px] uppercase tracking-[2px] text-[#524020] mb-2 font-medium">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#060400] border border-[#1E1500] p-4 text-[#F5E6C0] focus:border-[#C8920A] focus:outline-none transition-colors font-['DM_Sans'] text-sm"
            placeholder="thinker@threx.app"
            required
          />
        </div>

        {error && (
          <p className="text-[#C2410C] text-xs font-['DM_Sans'] tracking-wide">{error}</p>
        )}

        {message && (
          <p className="text-[#C8920A] text-xs font-['DM_Sans'] tracking-wide">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#C8920A] text-[#060400] font-['DM_Sans'] text-xs uppercase tracking-[2px] font-bold hover:bg-[#F0B429] transition-all disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Recovery Link'}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-[#1E1500] text-center">
        <p className="text-[#524020] text-xs font-['DM_Sans'] tracking-wide">
          Remembered your password? <a href="/login" className="text-[#C8920A] hover:text-[#F0B429] transition-colors no-underline">Sign In</a>
        </p>
      </div>
    </div>
  );
}
