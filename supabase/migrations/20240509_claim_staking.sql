-- Claim Staking Schema

-- 1. Claims (Extends a node into a formal staked claim)
CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'open', -- 'open', 'resolved_true', 'resolved_false', 'disputed'
    resolution_note TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(node_id)
);

-- 2. Claim Positions (Stakes/Votes from other users)
CREATE TABLE IF NOT EXISTS claim_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    position TEXT NOT NULL, -- 'agree', 'disagree'
    confidence INTEGER CHECK (confidence >= 1 AND confidence <= 5),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(claim_id, user_id)
);

-- Enable RLS
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_positions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view claims"
    ON claims FOR SELECT
    USING (true);

CREATE POLICY "Anyone can view positions"
    ON claim_positions FOR SELECT
    USING (true);

CREATE POLICY "Authors can update their claims"
    ON claims FOR UPDATE
    USING (auth.uid() = author_id);

CREATE POLICY "Users can insert positions"
    ON claim_positions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_positions_claim_id ON claim_positions(claim_id);
