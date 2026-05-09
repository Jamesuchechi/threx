-- Reputation System Schema

-- 1. Reputation Events (Individual logs)
CREATE TABLE IF NOT EXISTS reputation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    node_id UUID REFERENCES nodes(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'citation_received', 'contradiction_detected', 'high_longevity_score', etc.
    domain TEXT,
    weight INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Reputation Scores (Aggregated)
CREATE TABLE IF NOT EXISTS reputation_scores (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    rank INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, domain)
);

-- Enable RLS
ALTER TABLE reputation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_scores ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view reputation scores"
    ON reputation_scores FOR SELECT
    USING (true);

CREATE POLICY "Anyone can view reputation events"
    ON reputation_events FOR SELECT
    USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rep_events_user_id ON reputation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_rep_scores_domain_score ON reputation_scores(domain, score DESC);
