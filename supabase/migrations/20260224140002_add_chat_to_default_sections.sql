-- Migration: Add 'chat' to default allowed_sections and backfill existing users
-- Created: 2026-02-24
-- Rollback: ALTER TABLE public.users ALTER COLUMN allowed_sections SET DEFAULT ARRAY['weather', 'cart'];
--           UPDATE public.users SET allowed_sections = array_remove(allowed_sections, 'chat');

-- Update default to include chat
ALTER TABLE public.users
ALTER COLUMN allowed_sections SET DEFAULT ARRAY['weather', 'cart', 'chat'];

-- Backfill: add 'chat' to all existing users who don't already have it
UPDATE public.users
SET allowed_sections = array_append(allowed_sections, 'chat')
WHERE NOT (allowed_sections @> ARRAY['chat']);
