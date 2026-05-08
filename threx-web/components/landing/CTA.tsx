import React from 'react';

export default function CTA() {
  return (
    <section className="cta-section" id="early-access">
      <h2 className="cta-title reveal">JOIN THREX</h2>
      <p className="cta-sub reveal reveal-delay-1">Two hundred founding members. Invite only. Apply below.</p>
      <div className="cta-input-wrap reveal reveal-delay-2">
        <input className="cta-input" type="email" placeholder="your@email.com"/>
        <button className="cta-submit">Apply</button>
      </div>
      <p className="cta-note reveal reveal-delay-3">We review applications manually. Serious thinkers only.</p>
    </section>
  );
}
