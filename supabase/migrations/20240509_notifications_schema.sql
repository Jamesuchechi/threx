-- Notifications Table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('reaction', 'connection_request', 'node_cited', 'new_match', 'system')),
    node_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = recipient_id);

-- Index for performance
CREATE INDEX idx_notifications_recipient_unread ON public.notifications(recipient_id, is_read) WHERE is_read = false;

-- Function to handle notification creation on reaction
CREATE OR REPLACE FUNCTION handle_new_reaction_notification()
RETURNS TRIGGER AS $$
DECLARE
    node_author_id UUID;
BEGIN
    SELECT author_id INTO node_author_id FROM public.nodes WHERE id = NEW.node_id;
    
    -- Don't notify if the user reacts to their own node
    IF node_author_id != NEW.user_id THEN
        INSERT INTO public.notifications (recipient_id, actor_id, type, node_id, data)
        VALUES (
            node_author_id,
            NEW.user_id,
            'reaction',
            NEW.node_id,
            jsonb_build_object('reaction_type', NEW.type)
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_reaction_created
    AFTER INSERT ON public.node_reactions
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_reaction_notification();
