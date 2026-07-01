-- ============================================================
-- RLS INFINITE RECURSION FIX
-- Run this in Supabase SQL Editor to fix the "infinite recursion
-- detected in policy for relation profiles" error.
-- ============================================================

-- Step 1: Create security definer helpers that bypass RLS
-- These functions read profiles without triggering RLS policies,
-- breaking the recursion loop.

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::TEXT FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION get_my_chapter_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT chapter_id FROM profiles WHERE id = auth.uid();
$$;

-- Step 2: Drop all recursive policies
DROP POLICY IF EXISTS "areas_all_super_admin" ON areas;
DROP POLICY IF EXISTS "chapters_all_super_admin" ON chapters;
DROP POLICY IF EXISTS "categories_all_super_admin" ON categories;
DROP POLICY IF EXISTS "profiles_all_super_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_all_chapter_admin" ON profiles;
DROP POLICY IF EXISTS "member_inquiries_all_chapter_admin" ON member_inquiries;
DROP POLICY IF EXISTS "member_inquiries_all_super_admin" ON member_inquiries;
DROP POLICY IF EXISTS "contact_inquiries_select_super_admin" ON contact_inquiries;
DROP POLICY IF EXISTS "gallery_posts_all_super_admin" ON gallery_posts;
DROP POLICY IF EXISTS "gallery_posts_all_chapter_admin" ON gallery_posts;
DROP POLICY IF EXISTS "gallery_images_all_chapter_admin" ON gallery_images;
DROP POLICY IF EXISTS "gallery_images_all_super_admin" ON gallery_images;
DROP POLICY IF EXISTS "availability_all_super_admin" ON admin_availability;
DROP POLICY IF EXISTS "slots_all_super_admin" ON appointment_slots;
DROP POLICY IF EXISTS "hero_slides_all_super_admin" ON hero_slides;

-- Step 3: Recreate all policies using helper functions (no recursion)

-- Areas
CREATE POLICY "areas_all_super_admin" ON areas FOR ALL USING (
  get_my_role() = 'super_admin'
);

-- Chapters
CREATE POLICY "chapters_all_super_admin" ON chapters FOR ALL USING (
  get_my_role() = 'super_admin'
);

-- Categories
CREATE POLICY "categories_all_super_admin" ON categories FOR ALL USING (
  get_my_role() = 'super_admin'
);

-- Profiles
CREATE POLICY "profiles_all_super_admin" ON profiles FOR ALL USING (
  get_my_role() = 'super_admin'
);
CREATE POLICY "profiles_all_chapter_admin" ON profiles FOR ALL USING (
  get_my_role() = 'chapter_admin'
  AND get_my_chapter_id() = profiles.chapter_id
);

-- Member Inquiries
CREATE POLICY "member_inquiries_all_chapter_admin" ON member_inquiries FOR ALL USING (
  get_my_role() = 'chapter_admin'
  AND get_my_chapter_id() = member_inquiries.chapter_id
);
CREATE POLICY "member_inquiries_all_super_admin" ON member_inquiries FOR ALL USING (
  get_my_role() = 'super_admin'
);

-- Contact Inquiries
CREATE POLICY "contact_inquiries_select_super_admin" ON contact_inquiries FOR SELECT USING (
  get_my_role() = 'super_admin'
);

-- Gallery Posts
CREATE POLICY "gallery_posts_all_super_admin" ON gallery_posts FOR ALL USING (
  get_my_role() = 'super_admin'
);
CREATE POLICY "gallery_posts_all_chapter_admin" ON gallery_posts FOR ALL USING (
  get_my_role() = 'chapter_admin'
  AND get_my_chapter_id() = gallery_posts.chapter_id
);

-- Gallery Images
CREATE POLICY "gallery_images_all_chapter_admin" ON gallery_images FOR ALL USING (
  get_my_role() = 'chapter_admin'
  AND EXISTS (
    SELECT 1 FROM gallery_posts gp
    WHERE gp.id = gallery_images.post_id
      AND gp.chapter_id = get_my_chapter_id()
  )
);
CREATE POLICY "gallery_images_all_super_admin" ON gallery_images FOR ALL USING (
  get_my_role() = 'super_admin'
);

-- Admin Availability
CREATE POLICY "availability_all_super_admin" ON admin_availability FOR ALL USING (
  get_my_role() = 'super_admin'
);

-- Appointment Slots
CREATE POLICY "slots_all_super_admin" ON appointment_slots FOR ALL USING (
  get_my_role() = 'super_admin'
);

-- Hero Slides
CREATE POLICY "hero_slides_all_super_admin" ON hero_slides FOR ALL USING (
  get_my_role() = 'super_admin'
);
