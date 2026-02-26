-- Migration: Add geolocation and IP columns to login_history
-- Created: 2026-02-26
-- Rollback: ALTER TABLE public.login_history DROP COLUMN IF EXISTS latitude, DROP COLUMN IF EXISTS longitude, DROP COLUMN IF EXISTS ip_address;

ALTER TABLE public.login_history
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS ip_address text;
