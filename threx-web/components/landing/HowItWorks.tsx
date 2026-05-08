import React from 'react';

export default function HowItWorks() {
  return (
    <section className="how-section" id="how">
      <div className="how-inner">
        <div style={{textAlign: "center"}}>
          <div className="section-label reveal" style={{justifyContent: "center"}}><span style={{display: "block", width: "28px", height: "1px", background: "var(--gold-dim)"}}></span>How It Works</div>
          <h2 className="section-title reveal reveal-delay-1" style={{textAlign: "center"}}>Every action <em>compounds.</em></h2>
          <p className="section-body reveal reveal-delay-2" style={{margin: "0 auto 0", textAlign: "center"}}>The platform gets more valuable the more you use it. Each contribution builds on the last.</p>
        </div>
        <div className="how-steps">
          <div className="how-step reveal">
            <div className="how-step-num">01</div>
            <div className="how-step-title">Publish a Node</div>
            <div className="how-step-body">Share an idea, hypothesis, claim, or research note. Attach evidence. Stake your reputation on it.</div>
          </div>
          <div className="how-step reveal reveal-delay-1">
            <div className="how-step-num">02</div>
            <div className="how-step-title">AI Connects It</div>
            <div className="how-step-body">The system finds related nodes across the network. Contradictions flagged. Citations tracked automatically.</div>
          </div>
          <div className="how-step reveal reveal-delay-2">
            <div className="how-step-num">03</div>
            <div className="how-step-title">Agent Finds People</div>
            <div className="how-step-body">Your agent surfaces collaborators thinking about adjacent problems — with a plain-language explanation of why.</div>
          </div>
          <div className="how-step reveal reveal-delay-3">
            <div className="how-step-num">04</div>
            <div className="how-step-title">You Collaborate</div>
            <div className="how-step-body">Co-author live documents, work in Build Rooms, stake claims together. Every collaboration is tracked.</div>
          </div>
          <div className="how-step reveal reveal-delay-1">
            <div className="how-step-num">05</div>
            <div className="how-step-title">Reputation Rises</div>
            <div className="how-step-body">Citations, accurate predictions, completed collaborations and peer reviews all compound your domain score.</div>
          </div>
          <div className="how-step reveal reveal-delay-2">
            <div className="how-step-num">06</div>
            <div className="how-step-title">Opportunity Arrives</div>
            <div className="how-step-body">Investors, research labs, and collaborators find you through Talent Access — no application needed.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
