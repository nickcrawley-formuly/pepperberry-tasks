-- Migration: Create chat_messages table for shared board
-- Created: 2026-02-24
-- Rollback: DROP TABLE IF EXISTS public.chat_messages;

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_created_at ON public.chat_messages (created_at);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read board messages
CREATE POLICY "All users can read chat messages"
  ON public.chat_messages
  FOR SELECT
  USING (true);

-- All authenticated users can post board messages
CREATE POLICY "All users can insert chat messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (true);
