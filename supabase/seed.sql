-- ============================================================
-- UCCI Platform - Seed Data
-- Run AFTER schema.sql
-- ============================================================

-- ─── Areas ───────────────────────────────────────────────────────────────────
INSERT INTO areas (id, name, slug) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Pune',  'pune'),
  ('a1000000-0000-0000-0000-000000000002', 'PCMC',  'pcmc');

-- ─── Chapters ─────────────────────────────────────────────────────────────────
-- Pune chapters (5)
INSERT INTO chapters (id, name, slug, area_id) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'East',    'east',    'a1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000002', 'West',    'west',    'a1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000003', 'North',   'north',   'a1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000004', 'South',   'south',   'a1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000005', 'Central', 'central', 'a1000000-0000-0000-0000-000000000001');

-- PCMC chapters (2)
INSERT INTO chapters (id, name, slug, area_id) VALUES
  ('c1000000-0000-0000-0000-000000000006', 'East', 'east', 'a1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000007', 'West', 'west', 'a1000000-0000-0000-0000-000000000002');

-- ─── Categories (20 realistic Indian business categories) ─────────────────────
INSERT INTO categories (name, slug, is_featured, meta_description) VALUES
  ('Chartered Accountant',       'chartered-accountant',       TRUE,  'Find verified Chartered Accountants in your UCCI chapter for tax, audit, and financial advisory services.'),
  ('IT Consultant',              'it-consultant',               TRUE,  'Connect with experienced IT Consultants and technology advisors through UCCI chapters.'),
  ('Real Estate Agent',          'real-estate-agent',           TRUE,  'Discover trusted real estate agents specializing in residential and commercial properties.'),
  ('Insurance Advisor',          'insurance-advisor',           TRUE,  'Find licensed insurance advisors for life, health, and business insurance solutions.'),
  ('Digital Marketing Agency',   'digital-marketing-agency',   TRUE,  'Connect with top digital marketing agencies for SEO, social media, and online advertising.'),
  ('Corporate Lawyer',           'corporate-lawyer',            FALSE, 'Access vetted corporate lawyers for business law, contracts, and compliance.'),
  ('Financial Planner',          'financial-planner',           FALSE, 'Work with certified financial planners for wealth management and investment planning.'),
  ('Architect',                  'architect',                   FALSE, 'Find experienced architects for residential, commercial, and interior design projects.'),
  ('Interior Designer',          'interior-designer',           FALSE, 'Discover creative interior designers transforming spaces across Pune and PCMC.'),
  ('Business Coach',             'business-coach',              FALSE, 'Connect with professional business coaches to accelerate your company growth.'),
  ('HR Consultant',              'hr-consultant',               FALSE, 'Find HR consultants for recruitment, training, and organizational development.'),
  ('Event Management',           'event-management',            FALSE, 'Book professional event management companies for corporate and personal events.'),
  ('Healthcare Consultant',      'healthcare-consultant',       FALSE, 'Connect with healthcare consultants for medical advisory and wellness programs.'),
  ('Educational Institution',    'educational-institution',     FALSE, 'Discover educational institutions offering professional development and training.'),
  ('Software Development',       'software-development',        FALSE, 'Find software development companies for custom applications and digital transformation.'),
  ('Logistics & Supply Chain',   'logistics-supply-chain',      FALSE, 'Connect with logistics and supply chain specialists for efficient business operations.'),
  ('Restaurant & Food Business', 'restaurant-food-business',    FALSE, 'Discover restaurant owners and food business entrepreneurs in your network.'),
  ('Travel Agency',              'travel-agency',               FALSE, 'Find travel agencies for corporate travel, MICE, and leisure bookings.'),
  ('Photography & Videography',  'photography-videography',     FALSE, 'Connect with professional photographers and videographers for business media.'),
  ('Manufacturing',              'manufacturing',               FALSE, 'Network with manufacturing business owners and industrial entrepreneurs.');
