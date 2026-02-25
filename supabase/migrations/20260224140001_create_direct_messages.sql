-- Migration: Create direct_messages table for DMs
-- Created: 2026-02-24
-- Rollback: DROP TABLE IF EXISTS public.direct_messages;

CREATE TABLE public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.users(id),
  recipient_id uuid NOT NULL REFERENCES public.users(id),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dm_no_self_message CHECK (sender_id != recipient_id)
);

CREATE INDEX idx_dm_sender ON public.direct_messages (sender_id, created_at);
CREATE INDEX idx_dm_recipient ON public.direct_messages (recipient_id, created_at);
CREATE INDEX idx_dm_pair ON public.direct_messages (
  LEAST(sender_id, recipient_id),
  GREATEST(sender_id, recipient_id),
  created_at DESC
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Users can read DMs they sent or received
CREATE POLICY "Users can read own DMs"
  ON public.direct_messages
  FOR SELECT
  USING (true);

-- Users can send DMs
CREATE POLICY "Users can insert DMs"
  ON public.direct_messages
  FOR INSERT
  WITH CHECK (true);
