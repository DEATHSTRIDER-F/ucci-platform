-- Chapter landing content: cover image, brief info, highlights (newline-separated)
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS cover_image_url TEXT NULL;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS info TEXT NULL;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS highlights TEXT NULL;
