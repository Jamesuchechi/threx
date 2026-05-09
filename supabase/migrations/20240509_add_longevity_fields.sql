-- Add longevity fields to nodes table
ALTER TABLE nodes 
ADD COLUMN IF NOT EXISTS longevity_score FLOAT DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS longevity_band TEXT DEFAULT 'ephemeral';

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_nodes_longevity_score ON nodes(longevity_score);
CREATE INDEX IF NOT EXISTS idx_nodes_longevity_band ON nodes(longevity_band);
