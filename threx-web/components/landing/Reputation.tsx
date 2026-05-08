import React from 'react';

export default function Reputation() {
  return (
    <section id="reputation" style={{padding: "120px 60px"}}>
      <div className="rep-section">
        <div>
          <div className="section-label reveal">Reputation System</div>
          <h2 className="section-title reveal reveal-delay-1">Signal, not <em>noise.</em></h2>
          <p className="section-body reveal reveal-delay-2">
            Threx replaces follower counts and vanity metrics with a reputation system that rewards quality of thinking, accuracy of prediction, and depth of contribution. Your score is built over years. It cannot be purchased. It cannot be gamed.
          </p>
          <br/>
          <p className="section-body reveal reveal-delay-3" style={{fontSize: "16px"}}>
            Reputation events include: nodes published, nodes cited by others, predictions resolved correctly, collaborations completed, peer reviews submitted, claims challenged with evidence — and decay mechanics that keep the system honest.
          </p>
        </div>
        <div className="rep-visual reveal reveal-delay-2">
          <div className="rep-card">
            <div className="rep-score-val">847</div>
            <div className="rep-score-info">
              <div className="rep-score-domain">AI / Machine Learning</div>
              <div className="rep-score-rank">Top 3% globally · 1,240 reputation events</div>
              <div className="rep-bar-wrap"><div className="rep-bar" style={{width: "84%"}}></div></div>
            </div>
          </div>
          <div className="rep-card">
            <div className="rep-score-val">612</div>
            <div className="rep-score-info">
              <div className="rep-score-domain">Dev Infrastructure</div>
              <div className="rep-score-rank">Top 8% globally · 842 reputation events</div>
              <div className="rep-bar-wrap"><div className="rep-bar" style={{width: "61%"}}></div></div>
            </div>
          </div>
          <div className="rep-card">
            <div className="rep-score-val">441</div>
            <div className="rep-score-info">
              <div className="rep-score-domain">Systems Design</div>
              <div className="rep-score-rank">Top 14% globally · 590 reputation events</div>
              <div className="rep-bar-wrap"><div className="rep-bar" style={{width: "44%"}}></div></div>
            </div>
          </div>
          <div className="rep-card">
            <div className="rep-score-val">298</div>
            <div className="rep-score-info">
              <div className="rep-score-domain">Bioethics</div>
              <div className="rep-score-rank">Top 22% globally · 301 reputation events</div>
              <div className="rep-bar-wrap"><div className="rep-bar" style={{width: "30%"}}></div></div>
            </div>
          </div>
          <div style={{display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "16px"}}>
            <span style={{padding: "6px 14px", background: "rgba(200,146,10,0.1)", border: "1px solid var(--gold-dim)", borderRadius: "2px", fontSize: "11px", color: "var(--gold-lt)", letterSpacing: "1px"}}>🔮 Early Caller ×4</span>
            <span style={{padding: "6px 14px", background: "rgba(194,65,12,0.1)", border: "1px solid #5A2400", borderRadius: "2px", fontSize: "11px", color: "var(--orange-lt)", letterSpacing: "1px"}}>⚡ Contrarian</span>
            <span style={{padding: "6px 14px", background: "rgba(217,119,6,0.1)", border: "1px solid #4A2800", borderRadius: "2px", fontSize: "11px", color: "var(--amber)", letterSpacing: "1px"}}>🌉 Bridge Builder ×2</span>
            <span style={{padding: "6px 14px", background: "rgba(80,180,100,0.08)", border: "1px solid #1A4020", borderRadius: "2px", fontSize: "11px", color: "#60C080", letterSpacing: "1px"}}>🧬 Evidence Changer</span>
          </div>
        </div>
      </div>
    </section>
  );
}
