-- Hero slides: separate mobile image (portrait) alongside desktop/PC image
-- Run in Supabase SQL Editor. Safe to re-run (IF NOT EXISTS).

ALTER TABLE hero_slides
  ADD COLUMN IF NOT EXISTS mobile_image_url VARCHAR(500);
