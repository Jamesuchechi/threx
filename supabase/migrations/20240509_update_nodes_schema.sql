-- 1. Update Existing 'nodes' Table
ALTER TABLE public.nodes
ADD COLUMN IF NOT EXISTS longevity_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS fts tsvector GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || coalesce(content, ''))) STORED;

-- Update RLS policies to respect soft deletes
DROP POLICY IF EXISTS "Nodes are viewable by everyone if public." ON public.nodes;
CREATE POLICY "Nodes are viewable by everyone if public." ON public.nodes
  FOR SELECT USING (visibility = 'public' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Authenticated users can view non-public nodes if they are the author." ON public.nodes;
CREATE POLICY "Authenticated users can view non-public nodes if they are the author." ON public.nodes
  FOR SELECT USING (auth.uid() = author_id AND deleted_at IS NULL);

-- 2. Create Node Versions (History)
CREATE TABLE IF NOT EXISTS public.node_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    commit_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Tags & Node-Tags Mapping
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.node_tags (
    node_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (node_id, tag_id)
);

-- 4. Create Node Reactions
CREATE TABLE IF NOT EXISTS public.node_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('builds_on', 'challenges', 'need_evidence', 'fascinating')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(node_id, user_id, type)
);

-- 5. Enable RLS on new tables
ALTER TABLE public.node_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_reactions ENABLE ROW LEVEL SECURITY;

-- Version Policies
CREATE POLICY "Versions inherit node visibility" ON public.node_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.nodes 
            WHERE nodes.id = node_versions.node_id 
            AND (nodes.visibility = 'public' OR nodes.author_id = auth.uid())
            AND nodes.deleted_at IS NULL
        )
    );

CREATE POLICY "Users can create versions" ON public.node_versions
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Tag Policies
CREATE POLICY "Tags are public" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tags" ON public.tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Node tags are public" ON public.node_tags FOR SELECT USING (true);
CREATE POLICY "Users can tag their nodes" ON public.node_tags FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.nodes WHERE nodes.id = node_id AND nodes.author_id = auth.uid())
);

-- Reaction Policies
CREATE POLICY "Reactions are viewable by everyone" ON public.node_reactions FOR SELECT USING (true);
CREATE POLICY "Users can create reactions" ON public.node_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their reactions" ON public.node_reactions FOR DELETE USING (auth.uid() = user_id);

-- 6. Trigger for saving node versions automatically
CREATE OR REPLACE FUNCTION save_node_version()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.content IS DISTINCT FROM NEW.content OR OLD.title IS DISTINCT FROM NEW.title) THEN
        INSERT INTO public.node_versions (node_id, author_id, title, content)
        VALUES (OLD.id, OLD.author_id, OLD.title, OLD.content);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS save_node_version_trigger ON public.nodes;
CREATE TRIGGER save_node_version_trigger
    BEFORE UPDATE ON public.nodes
    FOR EACH ROW
    EXECUTE FUNCTION save_node_version();
