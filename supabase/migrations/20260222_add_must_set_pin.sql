-- Migration: Add must_set_pin column to users table
-- Created: 2026-02-22
-- Rollback: ALTER TABLE public.users DROP COLUMN must_set_pin;

-- UP MIGRATION
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS must_set_pin BOOLEAN DEFAULT true;

-- Set existing admins to false (they already have real PINs)
UPDATE public.users SET must_set_pin = false WHERE role = 'admin';
