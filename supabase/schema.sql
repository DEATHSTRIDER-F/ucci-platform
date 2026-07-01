-- ============================================================
-- UCCI Platform - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Enumerated Types ─────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('super_admin', 'chapter_admin', 'member');
CREATE TYPE profile_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE inquiry_status AS ENUM ('pending', 'approved', 'rejected');

-- ─── Areas ───────────────────────────────────────────────────────────────────
CREATE TABLE areas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Chapters ─────────────────────────────────────────────────────────────────
CREATE TABLE chapters (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL,
  area_id     UUID NOT NULL REFERENCES areas(id) ON DELETE RESTRICT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (area_id, slug)
);

-- ─── Categories ───────────────────────────────────────────────────────────────
CREATE TABLE categories (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             VARCHAR(100) NOT NULL,
  slug             VARCHAR(100) UNIQUE NOT NULL,
  is_featured      BOOLEAN DEFAULT FALSE,
  meta_description TEXT,
  alt_text         VARCHAR(255),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id                     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                  VARCHAR(255) UNIQUE NOT NULL,
  full_name              VARCHAR(255) NOT NULL,
  role                   user_role DEFAULT 'member',
  status                 profile_status DEFAULT 'pending',
  business_name          VARCHAR(255),
  brand_tagline          VARCHAR(255),
  bio                    TEXT,
  phone                  VARCHAR(20),
  website_url            VARCHAR(255),
  linkedin_url           VARCHAR(255),
  business_address       TEXT,
  logo_url               VARCHAR(500),
  ideal_referral_target  TEXT,
  referral_triggers      TEXT,
  chapter_id             UUID REFERENCES chapters(id) ON DELETE SET NULL,
  category_id            UUID REFERENCES categories(id) ON DELETE SET NULL,
  membership_fee_paid    BOOLEAN DEFAULT FALSE,
  appointment_timestamp  TIMESTAMPTZ,
  assigned_admin_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- Chapter-category exclusivity: only one approved member per chapter-category pair
CREATE UNIQUE INDEX profiles_chapter_category_approved_unique
  ON profiles (chapter_id, category_id)
  WHERE status = 'approved';

-- ─── Member Inquiries (Lead Mediation) ────────────────────────────────────────
CREATE TABLE member_inquiries (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  chapter_id       UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  visitor_name     VARCHAR(255) NOT NULL,
  visitor_email    VARCHAR(255) NOT NULL,
  visitor_phone    VARCHAR(20),
  message          TEXT NOT NULL,
  status           inquiry_status DEFAULT 'pending',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at      TIMESTAMPTZ
);

-- ─── Contact Inquiries ────────────────────────────────────────────────────────
CREATE TABLE contact_inquiries (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  subject    VARCHAR(255),
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Gallery Posts ────────────────────────────────────────────────────────────
CREATE TABLE gallery_posts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title      VARCHAR(255) NOT NULL,
  content    TEXT,
  area_id    UUID REFERENCES areas(id) ON DELETE SET NULL,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Gallery Images ───────────────────────────────────────────────────────────
CREATE TABLE gallery_images (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id       UUID NOT NULL REFERENCES gallery_posts(id) ON DELETE CASCADE,
  image_url     VARCHAR(500) NOT NULL,
  alt_text      VARCHAR(255) NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Admin Availability ───────────────────────────────────────────────────────
CREATE TABLE admin_availability (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  start_time   TIME,
  end_time     TIME,
  reason       VARCHAR(255),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (admin_id, blocked_date, start_time, end_time)
);

-- ─── Appointment Slots ────────────────────────────────────────────────────────
CREATE TABLE appointment_slots (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slot_datetime        TIMESTAMPTZ NOT NULL,
  is_occupied          BOOLEAN DEFAULT FALSE,
  booked_by_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (admin_id, slot_datetime)
);

-- ─── Hero Slides (Superadmin-Controlled Carousel) ─────────────────────────────
CREATE TABLE hero_slides (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         VARCHAR(255),
  subtitle      TEXT,
  image_url     VARCHAR(500) NOT NULL,
  alt_text      VARCHAR(255) NOT NULL,
  cta_text      VARCHAR(100),
  cta_url       VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  created_by    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Updated At Trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_areas_updated_at BEFORE UPDATE ON areas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_member_inquiries_updated_at BEFORE UPDATE ON member_inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_posts_updated_at BEFORE UPDATE ON gallery_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hero_slides_updated_at BEFORE UPDATE ON hero_slides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SECURITY DEFINER HELPERS (read profiles without triggering RLS)
-- These bypass RLS so they can be safely called FROM policies
-- ============================================================

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

-- ============================================================
-- ROW-LEVEL SECURITY POLICIES
-- ============================================================

ALTER TABLE areas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters           ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_inquiries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_posts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images     ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_slots  ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides        ENABLE ROW LEVEL SECURITY;

-- ─── Areas: Public read, super_admin write ────────────────────────────────────
CREATE POLICY "areas_select_public" ON areas FOR SELECT USING (true);
CREATE POLICY "areas_all_super_admin" ON areas FOR ALL USING (
  get_my_role() = 'super_admin'
);

-- ─── Chapters: Public read, super_admin write ─────────────────────────────────
CREATE POLICY "chapters_select_public" ON chapters FOR SELECT USING (true);
CREATE POLICY "chapters_all_super_admin" ON chapters FOR ALL USING (
  get_my_role() = 'super_admin'
);

-- ─── Categories: Public read, super_admin write ───────────────────────────────
CREATE POLICY "categories_select_public" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_all_super_admin" ON categories FOR ALL USING (
  get_my_role() = 'super_admin'
);

-- ─── Profiles ─────────────────────────────────────────────────────────────────
-- Public visitors: approved profiles only
CREATE POLICY "profiles_select_approved" ON profiles FOR SELECT USING (status = 'approved');
-- Members: read own profile regardless of status
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
-- Members: update own profile
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
-- Super admins: full access (uses helper to avoid recursion)
CREATE POLICY "profiles_all_super_admin" ON profiles FOR ALL USING (
  get_my_role() = 'super_admin'
);
-- Chapter admins: access profiles in their chapter
CREATE POLICY "profiles_all_chapter_admin" ON profiles FOR ALL USING (
  get_my_role() = 'chapter_admin'
  AND get_my_chapter_id() = profiles.chapter_id
);

-- ─── Member Inquiries ─────────────────────────────────────────────────────────
-- Public: insert only
CREATE POLICY "member_inquiries_insert_public" ON member_inquiries FOR INSERT WITH CHECK (true);
-- Members: see approved inquiries targeted to them
CREATE POLICY "member_inquiries_select_member" ON member_inquiries FOR SELECT USING (
  target_member_id = auth.uid() AND status = 'approved'
);
-- Chapter admins: all operations in their chapter
CREATE POLICY "member_inquiries_all_chapter_admin" ON member_inquiries FOR ALL USING (
  get_my_role() = 'chapter_admin'
  AND get_my_chapter_id() = member_inquiries.chapter_id
);
-- Super admins: full access
CREATE POLICY "member_inquiries_all_super_admin" ON member_inquiries FOR ALL USING (
  get_my_role() = 'super_admin'
);

-- ─── Contact Inquiries ────────────────────────────────────────────────────────
-- Public: insert only
CREATE POLICY "contact_inquiries_insert_public" ON contact_inquiries FOR INSERT WITH CHECK (true);
-- Super admins: read all
CREATE POLICY "contact_inquiries_select_super_admin" ON contact_inquiries FOR SELECT USING (
  get_my_role() = 'super_admin'
);

-- ─── Gallery Posts ────────────────────────────────────────────────────────────
CREATE POLICY "gallery_posts_select_public" ON gallery_posts FOR SELECT USING (true);
CREATE POLICY "gallery_posts_all_super_admin" ON gallery_posts FOR ALL USING (
  get_my_role() = 'super_admin'
);
CREATE POLICY "gallery_posts_all_chapter_admin" ON gallery_posts FOR ALL USING (
  get_my_role() = 'chapter_admin'
  AND get_my_chapter_id() = gallery_posts.chapter_id
);

-- ─── Gallery Images ───────────────────────────────────────────────────────────
CREATE POLICY "gallery_images_select_public" ON gallery_images FOR SELECT USING (true);
-- Chapter admins: only images for their chapter's posts
CREATE POLICY "gallery_images_all_chapter_admin" ON gallery_images FOR ALL USING (
  get_my_role() = 'chapter_admin'
  AND EXISTS (
    SELECT 1 FROM gallery_posts gp
    WHERE gp.id = gallery_images.post_id
      AND gp.chapter_id = get_my_chapter_id()
  )
);
-- Super admins: full access
CREATE POLICY "gallery_images_all_super_admin" ON gallery_images FOR ALL USING (
  get_my_role() = 'super_admin'
);

-- ─── Admin Availability ───────────────────────────────────────────────────────
CREATE POLICY "availability_select_all_auth" ON admin_availability FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "availability_all_own_admin" ON admin_availability FOR ALL USING (admin_id = auth.uid());
CREATE POLICY "availability_all_super_admin" ON admin_availability FOR ALL USING (
  get_my_role() = 'super_admin'
);

-- ─── Appointment Slots ────────────────────────────────────────────────────────
CREATE POLICY "slots_select_public" ON appointment_slots FOR SELECT USING (true);
CREATE POLICY "slots_all_own_admin" ON appointment_slots FOR ALL USING (admin_id = auth.uid());
CREATE POLICY "slots_all_super_admin" ON appointment_slots FOR ALL USING (
  get_my_role() = 'super_admin'
);

-- ─── Hero Slides ──────────────────────────────────────────────────────────────
-- Public: read active slides only
CREATE POLICY "hero_slides_select_active" ON hero_slides FOR SELECT USING (is_active = true);
-- Super admins: full access (including inactive)
CREATE POLICY "hero_slides_all_super_admin" ON hero_slides FOR ALL USING (
  get_my_role() = 'super_admin'
);

