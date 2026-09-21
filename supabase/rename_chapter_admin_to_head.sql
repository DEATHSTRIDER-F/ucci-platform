-- Rename role chapter_admin -> chapter_head (run once on live DBs created before this change).
-- New projects using schema.sql already contain chapter_head.

-- 1. Enum value (policy expressions referencing it follow automatically)
ALTER TYPE user_role RENAME VALUE 'chapter_admin' TO 'chapter_head';

-- 2. Policy names (expressions already updated by the rename above; DROP+CREATE to rename)
-- Repeat per policy: profiles, member_inquiries, gallery_posts, gallery_images,
-- chapter_head_applications, storage.objects.
-- Example:
--   DROP POLICY "profiles_all_chapter_admin" ON profiles;
--   CREATE POLICY "profiles_all_chapter_head" ON profiles FOR ALL TO authenticated
--     USING (get_my_role() = 'chapter_head' AND ...)
--     WITH CHECK (...);
--   DROP POLICY "storage_chapter_admin_gallery" ON storage.objects;
--   CREATE POLICY "storage_chapter_head_gallery" ON storage.objects FOR ALL TO authenticated
--     USING (bucket_id = 'ucci-media' AND name LIKE 'gallery/%' AND EXISTS (
--       SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('chapter_head', 'super_admin')
--     ));
