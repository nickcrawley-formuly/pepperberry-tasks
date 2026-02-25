-- Migration: Add failed login tracking to users
-- Created: 2025-02-25
-- Rollback: ALTER TABLE public.users DROP COLUMN failed_login_count, DROP COLUMN failed_logins_since;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS failed_login_count INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS failed_logins_since TIMESTAMPTZ DEFAULT NOW() NOT NULL;
