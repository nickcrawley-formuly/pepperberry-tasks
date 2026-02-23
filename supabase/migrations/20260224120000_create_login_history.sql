-- Migration: Create login_history table for tracking login events
-- Created: 2026-02-24
-- Rollback: DROP TABLE IF EXISTS public.login_history;

CREATE TABLE public.login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  logged_in_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_login_history_user_date ON public.login_history (user_id, logged_in_at DESC);

ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to login_history"
  ON public.login_history
  FOR ALL
  USING (true)
  WITH CHECK (true);
