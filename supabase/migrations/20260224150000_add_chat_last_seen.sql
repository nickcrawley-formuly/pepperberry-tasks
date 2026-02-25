-- Migration: Add chat last-seen timestamps for unread tracking
-- Created: 2026-02-24
-- Rollback: ALTER TABLE public.users DROP COLUMN board_last_seen_at, DROP COLUMN dm_last_seen_at;

ALTER TABLE public.users
ADD COLUMN board_last_seen_at timestamptz NOT NULL DEFAULT now(),
ADD COLUMN dm_last_seen_at timestamptz NOT NULL DEFAULT now();
