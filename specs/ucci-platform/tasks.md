# Implementation Plan: UCCI Platform

## Overview

This implementation plan breaks down the UCCI Platform build into incremental, testable tasks. The approach prioritizes core infrastructure first (database, authentication, image optimization), then builds public-facing features (directories, search, SEO), followed by admin features and the unified onboarding workflow.

## Tasks

- [ ] 1. Database Schema and Seed Data Setup
  - Create Supabase project and configure environment variables
  - Execute SQL schema script (areas, chapters, categories, profiles, inquiries, gallery, appointments)
  - Create enumerated types (user_role, profile_status, inquiry_status)
  - Establish composite unique index on (chapter_id, category_id) for approved profiles
  - Implement Row-Level Security policies for all tables
  - Execute seed data script with Pune/PCMC areas and realistic Indian business data
  - _Requirements: 10.9, 10.10, 8.1, 9.1-9.7_

- [ ]* 1.1 Write property test for chapter-category exclusivity
  - **Property 5: Chapter-Category Exclusivity Invariant**
  - **Validates: Requirements 1.8, 1.9, 8.1-8.6**

- [ ]* 1.2 Write property test for RLS public visitor scoping
  - **Property 11: Role-Based Query Scoping - Public Visitor**
  - **Validates: Requirements 9.1, 9.2**

- [ ] 2. Next.js Project Initialization and Base Configuration
  - Initialize Next.js 14+ project with App Router and TypeScript
  - Install and configure Tailwind CSS and Shadcn UI
  - Configure UCCI brand color palette in Tailwind theme extension (brand-navy, brand-sapphire, brand-gold, brand-champagne, brand-white, brand-silver)
  - Set up Supabase client utilities (browser client with anon key, server client with service role key)
  - Configure TypeScript interfaces for database models (Area, Chapter, Category, Profile, etc.)
  - Create root layout with metadata configuration
  - Set up environment variables (.env.local, .env.production)
  - Configure netlify.toml with build command and security headers
  - _Requirements: 17.1-17.6, 18.1-18.3, 18.10_

- [ ]* 2.1 Write property test for brand color palette configuration
  - **Property 38: Brand Color Palette Configuration**
  - **Validates: Requirements 18.1, 18.2, 18.3, 18.10**

- [ ]* 2.2 Write unit tests for Supabase client initialization
  - Test that browser client uses anon key
  - Test that server client uses service role key
  - _Requirements: 15.3_

- [ ] 3. Image Optimization Utility
  - Create `/lib/utils/imageCompressor.ts` utility function
  - Implement HTML5 Canvas or Web Worker image processing
  - Convert uploaded images to WebP format
  - Compress images to maximum 250KB file size
  - Constrain dimensions to 1200px bounding box while preserving aspect ratio
  - Return File object ready for Supabase Storage upload
  - _Requirements: 1.2, 5.1-5.5_

- [ ]* 3.1 Write property test for image optimization round-trip

  - **Property 1: Image Optimization Round-Trip**
  - **Validates: Requirements 1.2, 5.1-5.5, 12.3**

- [ ] 4. Authentication System
  - Create `/app/login/page.tsx` with email/password form
  - Implement Server Action for Supabase Auth login
  - Create session management utilities (getSession, logout)
  - Implement middleware for protected route verification
  - Create redirect logic for unauthenticated access attempts
  - _Requirements: 2.1-2.6_

- [ ] 4.1 Write unit tests for authentication flow

  - Test successful login creates session
  - Test failed login returns error
  - Test logout clears session tokens
  - _Requirements: 2.2, 2.4_

- [ ]* 4.2 Write property test for protected route access control
  - **Property included in Navigation test**
  - **Validates: Requirements 2.5, 2.6**

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Global Navigation Header
  - Create `/components/nav/Header.tsx` as Client Component
  - Implement sticky positioning with Next.js Image for logo (with explicit dimensions and priority flag)
  - Apply brand color scheme: bg-brand-sapphire background, text-brand-silver for links, text-brand-gold for active states
  - Create navigation tabs: Home, About UCCI (dropdown), Chapters (cascading dropdown), Categories (dropdown), Start a Chapter (conditional), Contact Us, Gallery
  - Implement About UCCI dropdown with "Our Story" and "How It Works" (#how-it-works anchor)
  - Implement Chapters cascading dropdown grouped by Areas (Pune with 5 chapters, PCMC with 2 chapters)
  - Implement Categories dropdown displaying top 5 is_featured categories plus "View All" link
  - Implement conditional rendering for "Start a Chapter" tab (visible only when authenticated)
  - Implement profile section display (avatar, full name, email) when authenticated
  - Implement responsive transformation to mobile hamburger menu below 900px viewport width
  - _Requirements: 6.1-6.12, 18.4-18.9_

- [ ] 6.1 Write property test for authenticated navigation visibility

  - **Property 23: Authenticated Navigation Visibility**
  - **Validates: Requirements 6.9, 6.10, 6.11**

- [ ] 6.2 Write property test for responsive header transformation

  - **Property 24: Responsive Header Transformation**
  - **Validates: Requirements 6.12, 14.1-14.3**

- [ ] 6.3 Write unit tests for featured categories dropdown

  - Test dropdown displays max 5 categories where is_featured=true
  - Test "View All Categories" link is present
  - _Requirements: 6.8_

- [ ] 7. SEO Foundation - Metadata and Structured Data Utilities
  - Create `/lib/seo/metadata.ts` with dynamic metadata generator functions
  - Create `/lib/seo/structured-data.ts` with JSON-LD schema builders (Organization, WebSite, LocalBusiness)
  - Implement metadata generation for member profiles using member database data
  - Implement metadata generation for chapter pages using chapter and area data
  - Implement metadata generation for category pages with member counts
  - Create utility to inject JSON-LD scripts into page components
  - _Requirements: 4.1-4.5_

- [ ] 7.1 Write property test for dynamic metadata generation

  - **Property 17: Dynamic Metadata Generation**
  - **Validates: Requirements 4.1, 4.2, 4.3**

- [ ]* 7.2 Write property test for structured data injection
  - **Property 18: Structured Data Injection for Member Profiles**
  - **Validates: Requirements 4.5**

- [ ] 8. Homepage with Hero Carousel and Search
  - Create `/app/page.tsx` as Server Component
  - Apply brand color scheme: bg-brand-navy for page background, text-brand-white for headings, text-brand-gold accents
  - Inject Organization and WebSite JSON-LD schemas on homepage
  - Implement hero section with image carousel (smooth transitions)
  - Create `/components/search/GlobalSearch.tsx` Client Component overlaid on hero with brand-gold border highlights
  - Implement search logic to query approved members by name, business_name, or category across all areas/chapters
  - Display search results with only approved profiles
  - Ensure semantic HTML structure (<main>, <section>, <h1> hierarchy)
  - _Requirements: 4.4, 13.1-13.6, 18.4-18.9_

- [ ]* 8.1 Write property test for global search filtering
  - **Property 25: Global Search Filtering**
  - **Validates: Requirements 3.2, 3.3, 13.4, 13.5, 13.6**

- [ ] 9. Member Profile Pages with SEO Optimization
  - Create `/app/members/[id]/page.tsx` as Server Component
  - Implement generateMetadata() function to create dynamic title, description, and OpenGraph tags
  - Inject LocalBusiness/ProfessionalService JSON-LD schema with member data
  - Display member information (business name, bio, phone, website, logo, chapter, category)
  - Render logo using Next.js Image with explicit dimensions
  - Include lead inquiry form for public visitors (see task 13)
  - Use semantic HTML markup (<article>, <section>, heading hierarchy)
  - _Requirements: 4.1, 4.5, 4.7, 5.7, 5.9_

- [ ]* 9.1 Write property test for Next.js Image component attributes
  - **Property 21: Next.js Image Component Attributes**
  - **Validates: Requirements 5.7, 5.8, 5.9**

- [ ]* 9.2 Write property test for semantic HTML structure
  - **Property 19: Semantic HTML Structure**
  - **Validates: Requirements 4.7**

- [ ] 10. Chapter and Category Directory Pages
  - Create `/app/chapters/[slug]/page.tsx` as Server Component with generateMetadata()
  - Display all approved members filtered by chapter_id
  - Create `/app/categories/[slug]/page.tsx` as Server Component with generateMetadata()
  - Display all approved members filtered by category_id across all chapters
  - Create `/app/categories/page.tsx` listing all categories with member counts
  - Use semantic HTML and proper heading hierarchy
  - _Requirements: 3.4, 3.5, 4.2, 4.3, 10.6_

- [ ]* 10.1 Write property test for directory filtering by geography and category
  - **Property 26: Directory Filtering by Geography and Category**
  - **Validates: Requirements 3.4, 3.5**

- [ ]* 10.2 Write property test for pending profile invisibility
  - **Property 2: Pending Profile Invisibility**
  - **Validates: Requirements 1.14, 3.3, 3.6**

- [ ] 11. Checkpoint - Ensure all tests pass and SEO validation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Dynamic Sitemap Generation
  - Create `/app/sitemap.ts` file
  - Query Supabase for all areas, chapters, categories, and approved members
  - Generate sitemap.xml with URLs for all public pages
  - Exclude pending profiles from sitemap
  - _Requirements: 4.6_

- [ ]* 12.1 Write property test for sitemap dynamic content inclusion
  - **Property 20: Sitemap Dynamic Content Inclusion**
  - **Validates: Requirements 4.6**

- [ ] 13. Lead Inquiry Mediation Workflow
  - Create lead inquiry form component on member profile pages
  - Create Server Action `/app/actions/inquiries.ts` to handle lead submission
  - Create Lead_Inquiry record with status='pending' and associate with target member's chapter_id
  - Implement RLS policies: pending inquiries visible to Chapter_Admin and Super_Admin, hidden from target Member
  - Create admin dashboard view for pending lead inquiries
  - Implement admin approval/rejection Server Actions
  - On approval, update status to 'approved', display in member dashboard, and send email notification
  - On rejection, update status to 'rejected' and archive without member notification
  - _Requirements: 7.1-7.7_

- [ ]* 13.1 Write property test for lead mediation workflow visibility
  - **Property 15: Lead Mediation Workflow Visibility**
  - **Validates: Requirements 7.3, 7.4, 7.5**

- [ ]* 13.2 Write property test for lead inquiry chapter association
  - **Property 16: Lead Inquiry Chapter Association**
  - **Validates: Requirements 7.2**

- [ ]* 13.3 Write unit tests for email notification on approval
  - Test that approval triggers email send
  - _Requirements: 7.7_

- [ ] 14. Unified Onboarding Form - Part 1: Form UI and Validation
  - Create `/app/join/page.tsx` and `/components/forms/OnboardingForm.tsx` Client Component
  - Apply brand color scheme: bg-brand-sapphire for form cards, border-brand-gold for focused inputs, bg-brand-gold for primary submit button
  - Implement form fields: Company Full Name, Brand Tagline, Micro-Classification, Bio, Phone, Website (optional), LinkedIn (optional), Business Address
  - Implement collapsible accordion "Advanced Networking Profile (Optional)" with ideal_referral_target and referral_triggers text areas
  - Add realistic placeholder examples for networking fields (Indian market context)
  - Implement logo upload with ImageUploader component calling Image_Optimizer
  - Implement chapter and category selection dropdowns
  - Implement frontend validation: required fields, email format, phone format
  - Display validation warnings if chapter-category pair already has approved member
  - _Requirements: 1.1-1.4, 1.10, 18.4-18.9_

- [ ]* 14.1 Write property test for form validation required fields
  - **Property 29: Form Validation - Required Fields**
  - **Validates: Requirements 1.10, 11.5, 11.7**

- [ ] 15. Unified Onboarding Form - Part 2: Appointment Calendar Integration
  - Create `/components/calendar/AppointmentCalendar.tsx` Client Component
  - Query available appointment slots based on selected chapter
  - Implement dynamic admin routing: if chapter has Chapter_Admin, show their slots; otherwise show Super_Admin slots
  - Filter out occupied slots (is_occupied=true)
  - Filter out unavailable slots (admin_availability blackout dates/times)
  - Implement slot selection interface
  - Enable Submit button only when all required fields complete and slot selected
  - _Requirements: 1.3-1.7, 1.10_

- [ ]* 15.1 Write property test for dynamic admin routing
  - **Property 3: Dynamic Admin Routing for Appointments**
  - **Validates: Requirements 1.4, 1.5, 1.23, 1.24**

- [ ]* 15.2 Write property test for calendar slot filtering
  - **Property 4: Calendar Slot Filtering**
  - **Validates: Requirements 1.6, 1.7, 1.26, 1.27**

- [ ] 16. Unified Onboarding Form - Part 3: Submission and State Management
  - Create Server Action `/app/actions/onboarding.ts`
  - Implement PostgreSQL transaction with SELECT FOR UPDATE SKIP LOCKED for race condition prevention
  - Validate chapter-category exclusivity before submission
  - Upload optimized logo to Supabase Storage using upsert operation
  - Create profile record with status='pending', role='member', and appointment data
  - Generate Supabase Auth credentials and send login email
  - Flag selected appointment slot as occupied (is_occupied=true)
  - Implement error handling and structured error messages
  - _Requirements: 1.8, 1.9, 1.11-1.13, 5.6, 15.2, 15.5_

- [ ] 16.1 Write property test for appointment slot state transition

  - **Property 6: Appointment Slot State Transition**
  - **Validates: Requirements 1.13, 1.21**

- [ ]* 16.2 Write property test for server action input validation
  - **Property 32: Server Action Input Validation**
  - **Validates: Requirements 15.2, 15.5**

- [ ]* 16.3 Write property test for server action cache revalidation
  - **Property 33: Server Action Cache Revalidation**
  - **Validates: Requirements 15.4**

- [ ] 17. Checkpoint - Test complete onboarding flow end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Admin Dashboard - Pending Application Review
  - Create `/app/admin/applications/page.tsx` (protected route for admins)
  - Query and display pending profiles scoped by role (Chapter_Admin sees their chapter, Super_Admin sees all)
  - Display appointment timestamps and applicant details
  - Implement membership_fee_paid boolean toggle
  - Create approval Server Action: check membership_fee_paid=true, update status to 'approved', revalidate caches
  - Create rejection Server Action: update status to 'rejected', release appointment slot, archive profile
  - _Requirements: 1.16-1.21_

- [ ]* 18.1 Write property test for membership fee prerequisite
  - **Property 7: Membership Fee Prerequisite for Approval**
  - **Validates: Requirements 1.18**

- [ ]* 18.2 Write property test for approval state visibility toggle
  - **Property 8: Approval State Visibility Toggle**
  - **Validates: Requirements 1.19, 1.14**

- [ ] 18.3 Write property test for role-based query scoping chapter admin

  - **Property 10: Role-Based Query Scoping - Chapter Admin**
  - **Validates: Requirements 9.4, 7.3**

- [ ] 19. Admin Dashboard - Chapter Admin Creation and Assignment
  - Create admin interface for Super_Admin to create Chapter_Admin accounts
  - Require chapter_id assignment when creating Chapter_Admin
  - Update appointment routing logic when Chapter_Admin is assigned or removed
  - Implement RLS validation preventing Chapter_Admin from managing profiles outside their chapter
  - _Requirements: 1.22-1.24, 9.7_

- [ ]* 19.1 Write property test for cross-profile update prevention
  - **Property 14: Cross-Profile Update Prevention**
  - **Validates: Requirements 9.6**

- [ ]* 19.2 Write property test for role-based query scoping super admin
  - **Property 13: Role-Based Query Scoping - Super Admin**
  - **Validates: Requirements 9.5**

- [ ] 20. Admin Dashboard - Availability and Leave Management
  - Create `/app/admin/availability/page.tsx` for admins
  - Display calendar showing all operational time slots as available by default
  - Implement interface to mark specific dates/times as unavailable
  - Create Server Action to insert admin_availability records
  - Implement date range selection for leave/blackout periods
  - Create Server Action to re-enable previously blocked slots
  - Ensure changes immediately reflect in applicant-facing calendar
  - _Requirements: 1.25-1.29_

- [ ]* 20.1 Write property test for leave management round-trip
  - **Property 9: Leave Management Round-Trip**
  - **Validates: Requirements 1.28**

- [ ] 21. Category Management Admin Interface
  - Create `/app/admin/categories/page.tsx` (Super_Admin only)
  - Implement category CRUD operations via Server Actions
  - Generate URL-safe slugs from category names
  - Implement is_featured toggle for navigation dropdown
  - Prevent deletion of categories with associated approved members
  - Update featured categories in navigation header dynamically
  - _Requirements: 10.1-10.5_

- [ ]* 21.1 Write property test for URL-safe slug generation
  - **Property 27: URL-Safe Slug Generation**
  - **Validates: Requirements 10.1, 10.7**

- [ ]* 21.2 Write property test for referential integrity deletions
  - **Property 28: Referential Integrity for Deletions**
  - **Validates: Requirements 10.5, 10.12**

- [ ]* 21.3 Write property test for featured categories display
  - **Property 22: Featured Categories Display**
  - **Validates: Requirements 6.8, 10.3, 10.4**

- [ ] 22. Area and Chapter Management Admin Interface
  - Create `/app/admin/areas/page.tsx` (Super_Admin only)
  - Implement Area CRUD operations with slug generation
  - Implement Chapter CRUD operations requiring parent Area selection
  - Prevent deletion of Areas with nested Chapters
  - Verify seed data (Pune with 5 chapters, PCMC with 2 chapters) is present
  - _Requirements: 10.7-10.12_

- [ ] 23. Contact Us Page
  - Create `/app/contact/page.tsx` as Server Component
  - Display form with fields: name, email, subject, message
  - Display official UCCI address: "Office No 202, Commercial Building 4 HM Royal Next To Talab Masjid Kondhwa Pune - 411048"
  - Display primary contact phone: "8600241900"
  - Create Server Action to insert contact_inquiries record
  - Validate required fields (name, email, message) and email format
  - Display contact inquiries in Super_Admin dashboard
  - _Requirements: 11.1-11.7_

- [ ] 24. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 25. Gallery System - Admin Creation Interface
  - Create `/app/admin/gallery/new/page.tsx` (Super_Admin and Chapter_Admin)
  - Implement gallery post form with title, content, area_id, chapter_id, and multiple image uploads
  - Require alt text input for each image before saving
  - Process all gallery images through Image_Optimizer
  - Create Server Actions to insert gallery_posts and gallery_images records
  - Implement RLS policy: Chapter_Admins can only create posts for their assigned chapter
  - _Requirements: 12.1-12.3_

- [ ]* 25.1 Write property test for gallery image alt text requirement
  - **Property 30: Gallery Image Alt Text Requirement**
  - **Validates: Requirements 12.2, 12.6**

- [ ] 26. Gallery System - Public Display
  - Create `/app/gallery/page.tsx` as Server Component
  - Query and display all gallery posts in reverse chronological order
  - Create `/components/gallery/ImageCarousel.tsx` Client Component
  - Implement responsive carousel/slider displaying all images for each post
  - Ensure alt text is included in all img elements
  - Use semantic HTML markup
  - _Requirements: 12.4-12.6_

- [ ]* 26.1 Write property test for gallery post chronological ordering
  - **Property 31: Gallery Post Chronological Ordering**
  - **Validates: Requirements 12.4**

- [ ] 27. About Page with Anchor Navigation
  - Create `/app/about/page.tsx` as Server Component
  - Implement sections: "Our Story" and "How It Works" with anchor id="how-it-works"
  - Use semantic HTML structure
  - Ensure navigation dropdown links function correctly
  - _Requirements: 6.4_

- [ ] 28. Responsive Mobile Optimization
  - Audit all components for mobile viewport rendering
  - Ensure touch targets are minimum 44px × 44px on mobile
  - Implement vertical stacking for all forms on mobile viewports
  - Configure Next.js Image responsive behavior for mobile
  - Test hamburger menu expand/collapse interaction
  - _Requirements: 14.1-14.6_

- [ ]* 28.1 Write property test for mobile touch target sizing
  - **Property 35: Mobile Touch Target Sizing**
  - **Validates: Requirements 14.4**

- [ ]* 28.2 Write property test for mobile form layout
  - **Property 36: Mobile Form Layout**
  - **Validates: Requirements 14.5**

- [ ] 29. Supabase Client Key Security Validation
  - Audit all Server Actions to ensure proper key usage
  - Verify privileged operations use service role key
  - Verify public operations use anon key
  - Add comments documenting key selection rationale
  - _Requirements: 15.3_

- [ ]* 29.1 Write property test for Supabase client key selection
  - **Property 34: Supabase Client Key Selection**
  - **Validates: Requirements 15.3**

- [ ] 30. Environment Variable and Absolute URL Configuration
  - Create `.env.production` template with required variables
  - Implement utility function to generate absolute URLs using NEXT_PUBLIC_SITE_URL
  - Update all canonical link and OpenGraph URL generation to use utility
  - Verify netlify.toml environment variable configuration
  - _Requirements: 17.5, 17.6_

- [ ]* 30.1 Write property test for environment variable absolute URL generation
  - **Property 37: Environment Variable Absolute URL Generation**
  - **Validates: Requirements 17.6**

- [ ] 31. Netlify Deployment Configuration
  - Verify netlify.toml build command is set to `npm run build`
  - Configure security headers: Content-Security-Policy, X-Robots-Tag, Cache-Control, X-Content-Type-Options
  - Test Server Actions execute within Netlify Functions timeout limits (10s)
  - Verify @netlify/plugin-nextjs compatibility
  - Test deployment to staging environment
  - _Requirements: 17.1-17.4_

- [ ] 32. Performance and Core Web Vitals Optimization
  - Run Lighthouse audit on all major pages
  - Verify Server Components are used for all SEO-critical pages
  - Verify explicit dimensions on all Next.js Image components
  - Verify priority flag on above-fold images
  - Measure and optimize for LCP < 2.5s, FID < 100ms, CLS < 0.1
  - Set up performance monitoring
  - _Requirements: 16.1-16.6_

- [ ] 33. Final Checkpoint and Production Readiness
  - Run complete test suite and ensure 100% pass rate
  - Perform end-to-end testing of all user journeys
  - Validate SEO metadata on all dynamic routes using Google Rich Results Test
  - Verify sitemap.xml accessibility and content
  - Test image optimization pipeline with various file sizes and formats
  - Verify RLS policies prevent unauthorized access
  - Document any known limitations or future enhancements
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout development
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- The implementation prioritizes infrastructure → public features → admin features → onboarding workflow
