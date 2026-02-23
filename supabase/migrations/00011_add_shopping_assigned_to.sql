-- Migration: Add assigned_to column to shopping_items
-- Created: 2026-02-23
-- Rollback: ALTER TABLE public.shopping_items DROP COLUMN assigned_to;

ALTER TABLE public.shopping_items
ADD COLUMN assigned_to uuid REFERENCES public.users(id);
