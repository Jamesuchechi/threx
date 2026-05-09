-- Add longevity reasoning column
ALTER TABLE nodes 
ADD COLUMN IF NOT EXISTS longevity_reasoning TEXT;
