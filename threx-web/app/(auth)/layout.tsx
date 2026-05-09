import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-wrapper">
      {/* Left Column: Context */}
      <aside className="auth-side-context">
        <div className="hero-grid" style={{ opacity: 0.05 }} />
        
        <div style={{ maxWidth: '480px' }}>
          <blockquote className="auth-context-quote">
            "Your ideas are <span>nodes</span> in a collective intelligence. 
            Compound your knowledge, connect to the source, and claim your intellectual sovereignty."
          </blockquote>
          <p className="auth-context-sub">THREX — The Infrastructure for Serious Minds</p>
        </div>
        
        {/* Subtle decorative ornament */}
        <div className="ornament-divider" style={{ justifyContent: 'flex-start', marginTop: '40px', opacity: 0.3 }}>
          <div className="ornament-diamond" />
          <div className="ornament-line" style={{ maxWidth: '120px' }} />
        </div>
      </aside>

      {/* Right Column: Form */}
      <main className="auth-side-form">
        <div className="hero-grid" style={{ opacity: 0.03 }} />
        
        <div className="z-10 w-full flex flex-col items-center">
          <div className="flex justify-center mb-12">
            <a href="/" className="nav-logo">
              THREX
            </a>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
