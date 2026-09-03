-- Migration: Add icon_name and icon_color to categories
-- Run in Supabase SQL Editor if schema.sql was already applied

ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon_name VARCHAR(100);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon_color VARCHAR(7);

-- Optional: backfill existing categories with defaults
-- UPDATE categories SET icon_color = '#D4AF37' WHERE icon_color IS NULL;
