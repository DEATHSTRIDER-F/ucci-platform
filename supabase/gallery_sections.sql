-- Gallery sections: news (videos + image posts), events (image gallery), videos (YouTube embeds)
-- Existing posts have no type → default 'event' per product decision.

ALTER TABLE gallery_posts
  ADD COLUMN IF NOT EXISTS post_type TEXT NOT NULL DEFAULT 'event'
    CHECK (post_type IN ('news','event','video'));

ALTER TABLE gallery_posts
  ADD COLUMN IF NOT EXISTS youtube_url TEXT NULL;

ALTER TABLE gallery_posts
  ADD COLUMN IF NOT EXISTS youtube_video_id TEXT NULL;

CREATE INDEX IF NOT EXISTS gallery_posts_post_type_idx ON gallery_posts(post_type);
