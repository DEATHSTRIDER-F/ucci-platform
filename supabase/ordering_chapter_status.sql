-- Ordering + chapter status management

-- Areas: manual ordering
ALTER TABLE areas ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

-- Chapters: manual ordering + active/inactive status
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Categories: manual ordering
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS areas_display_order_idx ON areas(display_order);
CREATE INDEX IF NOT EXISTS chapters_display_order_idx ON chapters(display_order);
CREATE INDEX IF NOT EXISTS categories_display_order_idx ON categories(display_order);
CREATE INDEX IF NOT EXISTS chapters_is_active_idx ON chapters(is_active);

-- Backfill: alphabetical baseline so existing rows have a sane order
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) - 1 AS rn FROM areas
)
UPDATE areas SET display_order = ranked.rn FROM ranked WHERE areas.id = ranked.id;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) - 1 AS rn FROM chapters
)
UPDATE chapters SET display_order = ranked.rn FROM ranked WHERE chapters.id = ranked.id;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) - 1 AS rn FROM categories
)
UPDATE categories SET display_order = ranked.rn FROM ranked WHERE categories.id = ranked.id;
