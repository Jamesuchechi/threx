"use client";

import React, { useState } from 'react';
import { createClient } from '../../../lib/supabase/client';

const DOMAINS = [
  "Artificial Intelligence", "Epistemology", "Neuroscience", 
  "Complex Systems", "Formal Verification", "Bio-Engineering",
  "Philosophy of Mind", "Economics", "Quantum Computing"
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [thinkingStyle, setThinkingStyle] = useState('');

  const supabase = createClient();

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const toggleDomain = (domain: string) => {
    setSelectedDomains(prev => 
      prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
    );
  };

  const handleComplete = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          full_name: fullName,
          bio,
          domain_tags: selectedDomains,
          thinking_style: thinkingStyle,
        })
        .eq('id', user.id);

      if (!error) {
        window.location.href = '/feed';
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Progress Indicator */}
      <div className="flex justify-between mb-12">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 mx-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#C8920A]' : 'bg-[#1E1500]'}`} />
        ))}
      </div>

      {step === 1 && (
        <section className="space-y-8">
          <header>
            <h2 className="font-['Cinzel'] text-3xl font-bold text-[#F5E6C0]">Personal Identity</h2>
            <p className="font-['Cormorant_Garamond'] text-xl text-[#A8885A] italic">How should the network recognize you?</p>
          </header>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-[2px] text-[#524020] mb-2">Username</label>
              <input 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0C0900] border border-[#1E1500] p-4 text-[#F5E6C0] focus:border-[#C8920A] focus:outline-none transition-colors font-['DM_Sans']"
                placeholder="e.g. von_neumann"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[2px] text-[#524020] mb-2">Full Name</label>
              <input 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#0C0900] border border-[#1E1500] p-4 text-[#F5E6C0] focus:border-[#C8920A] focus:outline-none transition-colors font-['DM_Sans']"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[2px] text-[#524020] mb-2">Short Bio</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#0C0900] border border-[#1E1500] p-4 text-[#F5E6C0] focus:border-[#C8920A] focus:outline-none transition-colors font-['DM_Sans'] min-h-[100px]"
                placeholder="Briefly describe your areas of focus..."
              />
            </div>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-8">
          <header>
            <h2 className="font-['Cinzel'] text-3xl font-bold text-[#F5E6C0]">Intellectual Domains</h2>
            <p className="font-['Cormorant_Garamond'] text-xl text-[#A8885A] italic">Select the spheres of knowledge you inhabit</p>
          </header>
          
          <div className="grid grid-cols-2 gap-3">
            {DOMAINS.map((domain) => (
              <button
                key={domain}
                onClick={() => toggleDomain(domain)}
                className={`p-4 text-xs uppercase tracking-[1px] border transition-all duration-300 ${
                  selectedDomains.includes(domain) 
                    ? 'bg-[#C8920A] text-[#060400] border-[#C8920A]' 
                    : 'bg-[#0C0900] text-[#524020] border-[#1E1500] hover:border-[#524020]'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-8">
          <header>
            <h2 className="font-['Cinzel'] text-3xl font-bold text-[#F5E6C0]">Thinking Style</h2>
            <p className="font-['Cormorant_Garamond'] text-xl text-[#A8885A] italic">Describe your primary cognitive approach</p>
          </header>
          
          <div className="space-y-4">
            {[
              { id: 'analytical', label: 'Analytical & Rigorous', desc: 'Focus on first principles and formal logic.' },
              { id: 'synthetic', label: 'Synthetic & Cross-disciplinary', desc: 'Connecting disparate fields to find new insights.' },
              { id: 'empirical', label: 'Empirical & Data-driven', desc: 'Evidence-based reasoning and experimental results.' },
              { id: 'speculative', label: 'Speculative & Visionary', desc: 'Exploring long-range possibilities and future states.' }
            ].map((style) => (
              <button
                key={style.id}
                onClick={() => setThinkingStyle(style.id)}
                className={`w-full p-6 text-left border transition-all duration-300 ${
                  thinkingStyle === style.id 
                    ? 'bg-[#0C0900] border-[#C8920A]' 
                    : 'bg-[#0C0900] border-[#1E1500] hover:border-[#524020]'
                }`}
              >
                <h4 className={`text-sm font-bold uppercase tracking-[2px] mb-1 ${thinkingStyle === style.id ? 'text-[#C8920A]' : 'text-[#F5E6C0]'}`}>{style.label}</h4>
                <p className="text-xs text-[#524020]">{style.desc}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-8 text-center py-12">
          <div className="w-20 h-20 bg-[#C8920A]/10 border border-[#C8920A] rounded-full mx-auto flex items-center justify-center mb-8">
            <div className="w-4 h-4 bg-[#C8920A] rounded-full animate-ping" />
          </div>
          <header>
            <h2 className="font-['Cinzel'] text-3xl font-bold text-[#F5E6C0]">Identity Formed</h2>
            <p className="font-['Cormorant_Garamond'] text-xl text-[#A8885A] italic max-w-md mx-auto">
              Your profile is ready to join the collective knowledge graph.
            </p>
          </header>
        </section>
      )}

      {/* Navigation */}
      <div className="mt-12 flex justify-between pt-8 border-t border-[#1E1500]">
        {step > 1 && (
          <button 
            onClick={handleBack}
            className="text-[10px] uppercase tracking-[2px] text-[#524020] hover:text-[#F5E6C0] transition-colors"
          >
            Back
          </button>
        )}
        <div className="ml-auto">
          {step < 4 ? (
            <button 
              onClick={handleNext}
              className="py-3 px-8 bg-[#C8920A] text-[#060400] font-bold text-[10px] uppercase tracking-[2px] hover:bg-[#F0B429] transition-all"
            >
              Continue
            </button>
          ) : (
            <button 
              onClick={handleComplete}
              disabled={loading}
              className="py-3 px-8 bg-[#C8920A] text-[#060400] font-bold text-[10px] uppercase tracking-[2px] hover:bg-[#F0B429] transition-all"
            >
              {loading ? 'Entering...' : 'Enter the Network'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
