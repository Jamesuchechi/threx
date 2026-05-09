-- Add soft delete column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Update RLS for soft delete
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone if not deleted." ON profiles
  FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Nodes are viewable by everyone if public." ON nodes;
CREATE POLICY "Nodes are viewable by everyone if public and author not deleted." ON nodes
  FOR SELECT USING (
    visibility = 'public' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = nodes.author_id 
      AND profiles.deleted_at IS NULL
    )
  );
