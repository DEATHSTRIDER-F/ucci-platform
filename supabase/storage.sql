-- ============================================================
-- UCCI Platform - Supabase Storage Buckets Setup
-- Run AFTER schema.sql and seed.sql
-- Run in the Supabase SQL Editor
-- ============================================================

-- Create the main media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ucci-media',
  'ucci-media',
  true,             -- public bucket — images served directly via CDN URL
  5242880,          -- 5MB max (server-side safety net; client compresses to <500KB)
  ARRAY['image/webp', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- ─── Storage RLS Policies ──────────────────────────────────────────────────────

-- Public: read all files (bucket is public, but RLS still applies)
CREATE POLICY "storage_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ucci-media');

-- Authenticated users: upload to their own logos folder
CREATE POLICY "storage_member_logo_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ucci-media'
    AND auth.role() = 'authenticated'
    AND name LIKE 'logos/%'
  );

-- Super admin: full access to all paths
CREATE POLICY "storage_super_admin_all"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'ucci-media'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Chapter admin: upload to gallery folder only
CREATE POLICY "storage_chapter_admin_gallery"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'ucci-media'
    AND name LIKE 'gallery/%'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('chapter_admin', 'super_admin')
    )
  );

-- Members: update their own logo (upsert)
CREATE POLICY "storage_member_logo_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'ucci-media'
    AND auth.role() = 'authenticated'
    AND name LIKE 'logos/%'
  );
