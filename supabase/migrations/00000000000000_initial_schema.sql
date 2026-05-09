-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  thinking_style TEXT,
  domain_tags TEXT[],
  reputation_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create nodes table
CREATE TABLE IF NOT EXISTS nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('claim', 'question', 'hypothesis', 'essay', 'summary', 'data', 'project')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'circle', 'private')),
  longevity_band TEXT DEFAULT 'ephemeral',
  citation_count INTEGER DEFAULT 0,
  is_agent_draft BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Nodes Policies
CREATE POLICY "Nodes are viewable by everyone if public." ON nodes
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Authenticated users can view non-public nodes if they are the author." ON nodes
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Users can insert their own nodes." ON nodes
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own nodes." ON nodes
  FOR UPDATE USING (auth.uid() = author_id);
