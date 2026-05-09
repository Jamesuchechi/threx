"use client";

import React, { useState } from 'react';
import { createClient } from '../../../lib/supabase/client';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password updated successfully. Redirecting...');
      setTimeout(() => {
        window.location.href = '/feed';
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#0C0900] border border-[#1E1500] p-10 rounded-sm shadow-2xl relative">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-right from-[#C8920A] to-transparent" />
      
      <h2 className="font-['Cinzel'] text-2xl font-semibold text-[#F5E6C0] mb-2 tracking-tight">New Password</h2>
      <p className="font-['Cormorant_Garamond'] text-lg text-[#A8885A] mb-8 italic">Secure your access with a new credential</p>

      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <label className="block text-[10px] uppercase tracking-[2px] text-[#524020] mb-2 font-medium">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#060400] border border-[#1E1500] p-4 text-[#F5E6C0] focus:border-[#C8920A] focus:outline-none transition-colors font-['DM_Sans'] text-sm"
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-[2px] text-[#524020] mb-2 font-medium">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-[#060400] border border-[#1E1500] p-4 text-[#F5E6C0] focus:border-[#C8920A] focus:outline-none transition-colors font-['DM_Sans'] text-sm"
            placeholder="••••••••"
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
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
