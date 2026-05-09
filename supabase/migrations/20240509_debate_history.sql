-- Create node debate history table
CREATE TABLE IF NOT EXISTS node_debate_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
    mode TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE node_debate_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view debate history of public nodes"
    ON node_debate_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM nodes
            WHERE nodes.id = node_debate_history.node_id
            AND nodes.visibility = 'public'
        )
    );

CREATE POLICY "Authors can insert into debate history"
    ON node_debate_history FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM nodes
            WHERE nodes.id = node_debate_history.node_id
            AND nodes.author_id = auth.uid()
        )
    );

-- Add index
CREATE INDEX IF NOT EXISTS idx_debate_history_node_id ON node_debate_history(node_id);
