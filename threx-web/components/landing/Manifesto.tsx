import React from 'react';

export default function Manifesto() {
  return (
    <>
      <div className="ornament-divider">
        <div className="ornament-line"></div>
        <div className="ornament-diamond"></div>
        <div className="ornament-diamond" style={{background: "var(--amber)"}}></div>
        <div className="ornament-diamond"></div>
        <div className="ornament-line rev"></div>
      </div>
      <section className="manifesto-section">
        <p className="manifesto-quote reveal">
          "There is no platform that answers:<br/>
          <em>Who are the most capable people thinking about this problem right now,</em><br/>
          and how do I find them?"
        </p>
        <div className="manifesto-attr reveal reveal-delay-2">— The founding insight of Threx</div>
      </section>
      <div className="ornament-divider">
        <div className="ornament-line"></div>
        <div className="ornament-diamond"></div>
        <div className="ornament-diamond" style={{background: "var(--amber)"}}></div>
        <div className="ornament-diamond"></div>
        <div className="ornament-line rev"></div>
      </div>
    </>
  );
}
