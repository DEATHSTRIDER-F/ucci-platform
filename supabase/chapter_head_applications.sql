-- Chapter Head Applications (simple interest form → admin review)
-- Run this in Supabase SQL editor.

CREATE TABLE IF NOT EXISTS chapter_head_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  message TEXT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE chapter_head_applications ENABLE ROW LEVEL SECURITY;

-- Table privileges (RLS policies alone are not enough)
GRANT INSERT ON chapter_head_applications TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON chapter_head_applications TO authenticated;

DROP POLICY IF EXISTS "chapter_head_applications public insert" ON chapter_head_applications;
CREATE POLICY "chapter_head_applications public insert"
  ON chapter_head_applications FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "chapter_head_applications super all" ON chapter_head_applications;
CREATE POLICY "chapter_head_applications super all"
  ON chapter_head_applications FOR ALL TO authenticated
  USING (get_my_role() = 'super_admin') WITH CHECK (get_my_role() = 'super_admin');

DROP POLICY IF EXISTS "chapter_head_applications chapter all" ON chapter_head_applications;
CREATE POLICY "chapter_head_applications chapter all"
  ON chapter_head_applications FOR ALL TO authenticated
  USING (
    get_my_role() = 'chapter_admin'
    AND (chapter_id IS NULL OR chapter_id = get_my_chapter_id())
  )
  WITH CHECK (
    get_my_role() = 'chapter_admin'
    AND (chapter_id IS NULL OR chapter_id = get_my_chapter_id())
  );
