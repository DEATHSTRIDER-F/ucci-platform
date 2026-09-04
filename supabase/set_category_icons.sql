-- ============================================================
-- UCCI Platform - Set icons for all categories (FAST)
-- Run this in Supabase Dashboard > SQL Editor > New Query > Run
-- Table: categories (slug, icon_name, icon_color)
-- Icon system: Iconify "prefix:name" + hex color (works with CategoryIcon)
-- ============================================================

-- Ensure columns exist (safe to re-run)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon_name VARCHAR(100);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon_color VARCHAR(7);

-- ─── One-shot update for all 20 seed categories ─────────────────
UPDATE categories SET icon_name = 'mdi:calculator-variant',   icon_color = '#0EA5E9' WHERE slug = 'chartered-accountant';
UPDATE categories SET icon_name = 'mdi:laptop',               icon_color = '#3B82F6' WHERE slug = 'it-consultant';
UPDATE categories SET icon_name = 'mdi:home-city',            icon_color = '#F59E0B' WHERE slug = 'real-estate-agent';
UPDATE categories SET icon_name = 'mdi:shield-check',         icon_color = '#10B981' WHERE slug = 'insurance-advisor';
UPDATE categories SET icon_name = 'mdi:bullhorn',             icon_color = '#EC4899' WHERE slug = 'digital-marketing-agency';
UPDATE categories SET icon_name = 'mdi:scale-balance',        icon_color = '#8B5CF6' WHERE slug = 'corporate-lawyer';
UPDATE categories SET icon_name = 'mdi:finance',              icon_color = '#22C55E' WHERE slug = 'financial-planner';
UPDATE categories SET icon_name = 'mdi:floor-plan',           icon_color = '#F97316' WHERE slug = 'architect';
UPDATE categories SET icon_name = 'mdi:sofa',                 icon_color = '#A855F7' WHERE slug = 'interior-designer';
UPDATE categories SET icon_name = 'mdi:account-tie',          icon_color = '#0EA5E9' WHERE slug = 'business-coach';
UPDATE categories SET icon_name = 'mdi:account-group',        icon_color = '#6366F1' WHERE slug = 'hr-consultant';
UPDATE categories SET icon_name = 'mdi:party-popper',         icon_color = '#EF4444' WHERE slug = 'event-management';
UPDATE categories SET icon_name = 'mdi:heart-pulse',          icon_color = '#E11D48' WHERE slug = 'healthcare-consultant';
UPDATE categories SET icon_name = 'mdi:school',               icon_color = '#14B8A6' WHERE slug = 'educational-institution';
UPDATE categories SET icon_name = 'mdi:code-braces',          icon_color = '#3B82F6' WHERE slug = 'software-development';
UPDATE categories SET icon_name = 'mdi:truck-fast',           icon_color = '#F97316' WHERE slug = 'logistics-supply-chain';
UPDATE categories SET icon_name = 'mdi:silverware-fork-knife',icon_color = '#F59E0B' WHERE slug = 'restaurant-food-business';
UPDATE categories SET icon_name = 'mdi:airplane',             icon_color = '#06B6D4' WHERE slug = 'travel-agency';
UPDATE categories SET icon_name = 'mdi:camera',               icon_color = '#8B5CF6' WHERE slug = 'photography-videography';
UPDATE categories SET icon_name = 'mdi:factory',              icon_color = '#64748B' WHERE slug = 'manufacturing';

-- ─── Verify ─────────────────────────────────────────────────────
SELECT slug, name, icon_name, icon_color FROM categories ORDER BY name;

-- ─── Optional: default gold for any category still missing an icon ──
-- UPDATE categories SET icon_name = 'mdi:tag', icon_color = '#D4AF37' WHERE icon_name IS NULL OR icon_name = '';
