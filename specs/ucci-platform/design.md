# Design Document: UCCI Platform

## Overview

The UCCI Platform is a high-performance, SEO-optimized Next.js 14+ application using the App Router architecture with TypeScript, Tailwind CSS, Shadcn UI components, and Supabase as the backend. The system implements a BNI-style referral networking model with strict role-based access control, geographical area-chapter hierarchies, and a unified onboarding workflow featuring integrated appointment scheduling.

The platform prioritizes search engine indexability through dynamic metadata generation, JSON-LD structured data, semantic HTML, and aggressive image optimization. All design decisions focus on maximizing Core Web Vitals scores (LCP < 2.5s, FID < 100ms, CLS < 0.1) while maintaining security through Row-Level Security (RLS) policies and proper authentication boundaries.

## Architecture

### System Architecture Layers

**Presentation Layer (Next.js App Router)**
- Server Components for SEO-critical pages (homepage, member profiles, categories, chapters)
- Client Components for interactive features (search, forms, calendars, image uploads)
- Dynamic metadata generation via `generateMetadata()` on all dynamic routes
- JSON-LD schema injection for structured data

**Data Access Layer (Supabase Client)**
- Separate client instances for browser (anon key) and server (service role key)
- Server Actions for mutations requiring privileged access
- RLS policies enforced at database level for all queries
- Real-time subscriptions for admin dashboards (optional enhancement)

**Business Logic Layer**
- Server Actions for form submissions, approvals, and data mutations
- Custom validation functions for chapter-category exclusivity
- Image optimization pipeline executed client-side before upload
- Webhook handlers for appointment scheduling integrations

**Infrastructure Layer (Netlify)**
- Edge caching for static assets with aggressive Cache-Control headers
- Serverless functions for Next.js Server Actions (Function timeout: 10s)
- Environment variable management for multi-stage deployments
- Security headers (CSP, X-Frame-Options, X-Content-Type-Options)

### Technology Stack Justification

**Next.js 14+ App Router**: Enables Server Components for optimal SEO, automatic code splitting, and built-in image optimization. App Router architecture provides better performance than Pages Router through automatic static optimization and streaming SSR.

**TypeScript**: Provides compile-time type safety, reducing runtime errors and improving developer experience with autocomplete and refactoring tools.

**Tailwind CSS + Shadcn UI**: Utility-first CSS framework with zero runtime, ensuring minimal bundle size. Shadcn provides accessible, customizable components with proper ARIA attributes. Custom brand color palette is integrated into Tailwind's theme configuration to maintain consistent elite branding across all components.

**Supabase**: Open-source Firebase alternative with PostgreSQL database, built-in Row-Level Security, authentication, and storage. Provides real-time capabilities and automatic API generation.

**Netlify**: Optimized for Next.js deployments with @netlify/plugin-nextjs, offering edge caching, serverless functions, and instant rollbacks. Better integration with Next.js Server Actions compared to Vercel alternatives for this project scale.

## Brand Color Palette & Design System

### Color Palette Specifications

The UCCI Platform employs a sophisticated color palette designed to convey elite professionalism, trust, and exclusivity. The color scheme combines deep navy tones with metallic gold accents to reflect the premium nature of the business networking platform.

#### Primary Tones (Backgrounds & Deep Brand Identity)

**Deep Navy Blue (Midnight Blue)**: `#0B132B` - `brand-navy`
- **Usage**: Global page backgrounds, primary hero sections, footer backgrounds, dark mode surfaces
- **Purpose**: Establishes a sophisticated, professional foundation that conveys trust and stability

**Dark Sapphire (Secondary Slate)**: `#1C2541` - `brand-sapphire`
- **Usage**: Card backgrounds, navbar containers, alternating section blocks, interactive state shifts
- **Purpose**: Provides subtle depth variation while maintaining the professional dark aesthetic

#### Accent Tones (Elite Branding & Call-to-Actions)

**Metallic Gold (Primary Brand Accent)**: `#D4AF37` - `brand-gold`
- **Usage**: Brand logos, primary button backgrounds, critical typography headers, active nav states, border highlights
- **Purpose**: Signifies premium quality and exclusivity, draws attention to key interactive elements

**Warm Champagne (Subtle Highlight / Muted Gold)**: `#F3E5AB` - `brand-champagne`
- **Usage**: Sub-headings, text inline badges, icon containers, secondary border accents
- **Purpose**: Provides softer accent for secondary elements without overwhelming the design

#### Neutral Typography Tones

**Crisp White**: `#FFFFFF` - `brand-white`
- **Usage**: Main titles, primary button text over dark backgrounds, critical body copy
- **Purpose**: Ensures maximum readability and contrast against dark backgrounds

**Ice Silver (Muted Text)**: `#E0E1DD` - `brand-silver`
- **Usage**: Standard body paragraphs, form labels, footer text links, secondary metadata
- **Purpose**: Reduces visual fatigue while maintaining readability for large text blocks

### Tailwind CSS Configuration

The color palette is integrated into the Tailwind CSS configuration file (`tailwind.config.ts` or `tailwind.config.js`) under the `extend` block to ensure utility classes are available throughout the application.

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Primary Tones (Backgrounds & Deep Brand Identity)
          navy: '#0B132B',      // Deep Navy Blue - Global backgrounds, hero sections, footer
          sapphire: '#1C2541',  // Dark Sapphire - Card backgrounds, navbar, alternating sections
          
          // Accent Tones (Elite Branding & Call-to-Actions)
          gold: '#D4AF37',      // Metallic Gold - Primary accent, buttons, active states
          champagne: '#F3E5AB', // Warm Champagne - Sub-headings, badges, secondary accents
          
          // Neutral Typography Tones
          white: '#FFFFFF',     // Crisp White - Main titles, primary text
          silver: '#E0E1DD',    // Ice Silver - Body paragraphs, labels, secondary text
        },
      },
    },
  },
  plugins: [],
}

export default config
```

### Utility Class Examples

With this configuration, developers can use intuitive utility classes throughout the application:

**Background Colors**:
- `bg-brand-navy` - Global page backgrounds
- `bg-brand-sapphire` - Card and component backgrounds
- `bg-brand-gold` - Primary button backgrounds
- `bg-brand-champagne` - Subtle highlight backgrounds

**Text Colors**:
- `text-brand-white` - Main headings and critical content
- `text-brand-silver` - Body text and secondary content
- `text-brand-gold` - Emphasized text and links
- `text-brand-champagne` - Subtle text highlights

**Border Colors**:
- `border-brand-gold` - Primary borders and highlights
- `border-brand-champagne` - Secondary borders
- `border-brand-sapphire` - Subtle dividers

**State Variations**:
- `hover:bg-brand-gold` - Button hover states
- `active:border-brand-gold` - Active navigation indicators
- `focus:ring-brand-gold` - Focus ring colors for accessibility

### Design Implementation Guidelines

**Color Hierarchy**:
1. **Primary Surface**: Use `brand-navy` for main page backgrounds
2. **Secondary Surface**: Use `brand-sapphire` for elevated components (cards, modals, navigation)
3. **Primary Actions**: Use `brand-gold` for CTAs and primary buttons
4. **Secondary Actions**: Use `brand-champagne` for less prominent interactive elements
5. **Primary Text**: Use `brand-white` for headings and important content
6. **Secondary Text**: Use `brand-silver` for body text and metadata

**Contrast Requirements**:
- Ensure WCAG AA compliance (4.5:1 contrast ratio) for text readability
- `brand-white` on `brand-navy` provides excellent contrast
- `brand-gold` text on `brand-navy` meets accessibility standards
- `brand-silver` on `brand-sapphire` maintains readability

**Component-Specific Applications**:
- **Header/Navigation**: `bg-brand-sapphire` with `text-brand-silver`, active links in `text-brand-gold`
- **Hero Section**: `bg-brand-navy` with large `text-brand-white` headings and `text-brand-gold` accents
- **Cards**: `bg-brand-sapphire` with `border-brand-gold` for emphasis
- **Buttons**: Primary buttons use `bg-brand-gold text-brand-navy`, secondary buttons use `border-brand-gold text-brand-gold`
- **Footer**: `bg-brand-navy` with `text-brand-silver` body text and `text-brand-gold` links
- **Forms**: Input borders in `border-brand-silver`, focus states with `focus:border-brand-gold`

## Components and Interfaces

### Database Schema

**Enumerated Types**
```sql
CREATE TYPE user_role AS ENUM ('super_admin', 'chapter_admin', 'member');
CREATE TYPE profile_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE inquiry_status AS ENUM ('pending', 'approved', 'rejected');
```

**Core Tables**

**areas**
- id: UUID (primary key)
- name: VARCHAR(100) NOT NULL
- slug: VARCHAR(100) UNIQUE NOT NULL
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE

**chapters**
- id: UUID (primary key)
- name: VARCHAR(100) NOT NULL
- slug: VARCHAR(100) NOT NULL
- area_id: UUID (foreign key → areas.id)
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
- UNIQUE constraint on (area_id, slug)

**categories**
- id: UUID (primary key)
- name: VARCHAR(100) NOT NULL
- slug: VARCHAR(100) UNIQUE NOT NULL
- is_featured: BOOLEAN DEFAULT FALSE
- meta_description: TEXT
- alt_text: VARCHAR(255)
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE

**profiles**
- id: UUID (primary key, references auth.users)
- email: VARCHAR(255) UNIQUE NOT NULL
- full_name: VARCHAR(255) NOT NULL
- role: user_role DEFAULT 'member'
- status: profile_status DEFAULT 'pending'
- business_name: VARCHAR(255)
- brand_tagline: VARCHAR(255)
- bio: TEXT
- phone: VARCHAR(20)
- website_url: VARCHAR(255)
- linkedin_url: VARCHAR(255)
- business_address: TEXT
- logo_url: VARCHAR(500)
- ideal_referral_target: TEXT NULL
- referral_triggers: TEXT NULL
- chapter_id: UUID (foreign key → chapters.id)
- category_id: UUID (foreign key → categories.id)
- membership_fee_paid: BOOLEAN DEFAULT FALSE
- appointment_timestamp: TIMESTAMP WITH TIME ZONE
- assigned_admin_id: UUID (foreign key → profiles.id, nullable)
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
- UNIQUE constraint on (chapter_id, category_id) WHERE status = 'approved'

**member_inquiries**
- id: UUID (primary key)
- target_member_id: UUID (foreign key → profiles.id)
- chapter_id: UUID (foreign key → chapters.id)
- visitor_name: VARCHAR(255) NOT NULL
- visitor_email: VARCHAR(255) NOT NULL
- visitor_phone: VARCHAR(20)
- message: TEXT NOT NULL
- status: inquiry_status DEFAULT 'pending'
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
- reviewed_by: UUID (foreign key → profiles.id, nullable)
- reviewed_at: TIMESTAMP WITH TIME ZONE

**contact_inquiries**
- id: UUID (primary key)
- name: VARCHAR(255) NOT NULL
- email: VARCHAR(255) NOT NULL
- subject: VARCHAR(255)
- message: TEXT NOT NULL
- created_at: TIMESTAMP WITH TIME ZONE

**gallery_posts**
- id: UUID (primary key)
- title: VARCHAR(255) NOT NULL
- content: TEXT
- area_id: UUID (foreign key → areas.id)
- chapter_id: UUID (foreign key → chapters.id)
- created_by: UUID (foreign key → profiles.id)
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE

**gallery_images**
- id: UUID (primary key)
- post_id: UUID (foreign key → gallery_posts.id)
- image_url: VARCHAR(500) NOT NULL
- alt_text: VARCHAR(255) NOT NULL
- display_order: INTEGER DEFAULT 0
- created_at: TIMESTAMP WITH TIME ZONE

**admin_availability**
- id: UUID (primary key)
- admin_id: UUID (foreign key → profiles.id)
- blocked_date: DATE NOT NULL
- start_time: TIME (nullable, if NULL then entire day blocked)
- end_time: TIME (nullable)
- reason: VARCHAR(255)
- created_at: TIMESTAMP WITH TIME ZONE
- UNIQUE constraint on (admin_id, blocked_date, start_time, end_time)

**appointment_slots**
- id: UUID (primary key)
- admin_id: UUID (foreign key → profiles.id)
- slot_datetime: TIMESTAMP WITH TIME ZONE NOT NULL
- is_occupied: BOOLEAN DEFAULT FALSE
- booked_by_profile_id: UUID (foreign key → profiles.id, nullable)
- created_at: TIMESTAMP WITH TIME ZONE
- UNIQUE constraint on (admin_id, slot_datetime)
- **Concurrency Note**: Use PostgreSQL advisory locks or SELECT FOR UPDATE SKIP LOCKED in booking transactions to prevent race conditions where multiple concurrent applicants attempt to book the same slot simultaneously.

### Component Architecture

**Server Components** (SEO-optimized, pre-rendered)
- `app/page.tsx` - Homepage with hero carousel and search
- `app/chapters/[slug]/page.tsx` - Chapter detail pages
- `app/categories/[slug]/page.tsx` - Category directory pages
- `app/members/[id]/page.tsx` - Member profile pages
- `app/about/page.tsx` - About page with anchor navigation
- `app/gallery/page.tsx` - Gallery listing page
- `app/contact/page.tsx` - Contact page with static info

**Client Components** (Interactive features)
- `components/nav/Header.tsx` - Global navigation with dropdowns
- `components/search/GlobalSearch.tsx` - Homepage search bar
- `components/forms/OnboardingForm.tsx` - Unified application form with collapsible "Advanced Networking Profile (Optional)" accordion containing ideal_referral_target and referral_triggers text areas. Placeholders: ideal_referral_target: "e.g., Real estate developers launching residential projects in Baner, or local retail footwear brand owners looking to export." referral_triggers: "e.g., Listen for business owners saying: 'Our foot traffic is dropping, we need to build an e-commerce platform but don't know who to trust.'"
- `components/calendar/AppointmentCalendar.tsx` - Interactive slot selector
- `components/upload/ImageUploader.tsx` - Image upload with optimization
- `components/admin/ApprovalDashboard.tsx` - Admin pending queue
- `components/gallery/ImageCarousel.tsx` - Multi-image slider

**Shared Utilities**
- `lib/supabase/client.ts` - Browser Supabase client (anon key)
- `lib/supabase/server.ts` - Server Supabase client (service role key)
- `lib/utils/imageCompressor.ts` - WebP conversion and compression
- `lib/utils/slugify.ts` - URL-safe slug generation
- `lib/validation/exclusivity.ts` - Chapter-category uniqueness checks
- `lib/seo/metadata.ts` - Dynamic metadata generators
- `lib/seo/structured-data.ts` - JSON-LD schema builders

### API Routes and Server Actions

**Server Actions** (`app/actions/`)
- `onboarding.ts` - Handle unified application submission
- `admin.ts` - Profile approval, rejection, fee toggle
- `inquiries.ts` - Lead mediation workflow
- `categories.ts` - Category CRUD operations
- `areas.ts` - Area and chapter management
- `availability.ts` - Admin calendar management
- `contact.ts` - Contact form submission
- `gallery.ts` - Gallery post creation and image uploads

**API Routes** (`app/api/`)
- `app/api/webhooks/appointments/route.ts` - Webhook handler for Cal.com/Calendly
- `app/api/search/route.ts` - Global member search endpoint (optional, can use Server Action)

### Row-Level Security Policies

**profiles table**
```sql
-- Public can read only approved profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (status = 'approved');

-- Members can read their own profiles regardless of status
CREATE POLICY "Members can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Members can update their own profiles
CREATE POLICY "Members can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Super admins can do everything
CREATE POLICY "Super admins full access"
ON profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Chapter admins can read/update profiles in their chapter
CREATE POLICY "Chapter admins can manage their chapter"
ON profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND role = 'chapter_admin'
    AND chapter_id = profiles.chapter_id
  )
);
```

**member_inquiries table**
```sql
-- Public can insert inquiries
CREATE POLICY "Anyone can create inquiries"
ON member_inquiries FOR INSERT
WITH CHECK (true);

-- Members can read inquiries targeted to them (approved only)
CREATE POLICY "Members see approved inquiries"
ON member_inquiries FOR SELECT
USING (
  target_member_id = auth.uid()
  AND status = 'approved'
);

-- Chapter admins see inquiries in their chapter
CREATE POLICY "Chapter admins see their chapter inquiries"
ON member_inquiries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'chapter_admin'
    AND chapter_id = member_inquiries.chapter_id
  )
);

-- Super admins see all inquiries
CREATE POLICY "Super admins see all inquiries"
ON member_inquiries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);
```

**areas and chapters tables**
```sql
-- Public can read all areas and chapters
CREATE POLICY "Areas are viewable by everyone"
ON areas FOR SELECT USING (true);

CREATE POLICY "Chapters are viewable by everyone"
ON chapters FOR SELECT USING (true);

-- Only super admins can modify
CREATE POLICY "Only super admins can modify areas"
ON areas FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

CREATE POLICY "Only super admins can modify chapters"
ON chapters FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);
```

Similar RLS patterns apply to categories, gallery tables, and availability tables.

**gallery_posts table**
```sql
-- Public can read all gallery posts
CREATE POLICY "Gallery posts are viewable by everyone"
ON gallery_posts FOR SELECT USING (true);

-- Super admins can do everything
CREATE POLICY "Super admins full access to gallery"
ON gallery_posts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Chapter admins can only manage posts in their assigned chapter
CREATE POLICY "Chapter admins manage their chapter gallery"
ON gallery_posts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'chapter_admin'
    AND chapter_id = gallery_posts.chapter_id
  )
);
```

**gallery_images table**
```sql
-- Public can read all gallery images
CREATE POLICY "Gallery images are viewable by everyone"
ON gallery_images FOR SELECT
USING (true);

-- Chapter admins can manage images linked to their chapter posts
-- Critical: Explicit relational validation prevents unauthorized mutations
CREATE POLICY "Chapter admins can manage images linked to their chapter posts"
ON gallery_images FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM gallery_posts gp
        JOIN profiles p ON p.id = auth.uid()
        WHERE gp.id = gallery_images.post_id
        AND p.role = 'chapter_admin'
        AND p.chapter_id = gp.chapter_id
    )
);

-- Super admins can manage all gallery images
CREATE POLICY "Super admins can manage all gallery images"
ON gallery_images FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);
```

**Security Note on Gallery Images RLS:**
PostgreSQL Row-Level Security does not support policy inheritance. Each table requires explicit, relationally validated policies. The `gallery_images` policies use cross-table `EXISTS` checks to validate that:
1. Chapter admins can only manage images whose parent `gallery_posts` record matches their assigned `chapter_id`
2. Super admins have unrestricted access
3. Public visitors have read-only access

This prevents unauthorized image mutations from anonymous clients using the Supabase anon key.

**Chapter Admin Assignment and Permissions:**
- When a profile has role='chapter_admin', the assigned chapter_id field defines their permission boundary
- All RLS policies for Chapter_Admin scope queries and mutations to records matching their chapter_id
- The assigned_admin_id field in profiles table tracks which Chapter_Admin is responsible for reviewing a pending application (for Super_Admin assignment delegation)

## Data Models

### TypeScript Interfaces

```typescript
// Database types (auto-generated by Supabase CLI)
export type UserRole = 'super_admin' | 'chapter_admin' | 'member';
export type ProfileStatus = 'pending' | 'approved' | 'rejected';
export type InquiryStatus = 'pending' | 'approved' | 'rejected';

export interface Area {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  name: string;
  slug: string;
  area_id: string;
  area?: Area; // Joined relation
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  is_featured: boolean;
  meta_description: string | null;
  alt_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: ProfileStatus;
  business_name: string | null;
  brand_tagline: string | null;
  bio: string | null;
  phone: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  business_address: string | null;
  logo_url: string | null;
  ideal_referral_target: string | null;
  referral_triggers: string | null;
  chapter_id: string | null;
  category_id: string | null;
  membership_fee_paid: boolean;
  appointment_timestamp: string | null;
  assigned_admin_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  chapter?: Chapter;
  category?: Category;
  assigned_admin?: Profile;
}

export interface MemberInquiry {
  id: string;
  target_member_id: string;
  chapter_id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string | null;
  message: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  // Joined relations
  target_member?: Profile;
  chapter?: Chapter;
  reviewer?: Profile;
}

export interface GalleryPost {
  id: string;
  title: string;
  content: string | null;
  area_id: string;
  chapter_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  images?: GalleryImage[];
  creator?: Profile;
  area?: Area;
  chapter?: Chapter;
}

export interface GalleryImage {
  id: string;
  post_id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  created_at: string;
}

export interface AdminAvailability {
  id: string;
  admin_id: string;
  blocked_date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  created_at: string;
}

export interface AppointmentSlot {
  id: string;
  admin_id: string;
  slot_datetime: string;
  is_occupied: boolean;
  booked_by_profile_id: string | null;
  created_at: string;
}
```

### Form Data Transfer Objects

```typescript
export interface OnboardingFormData {
  company_full_name: string;
  brand_tagline: string;
  bio: string;
  phone: string;
  website_url?: string; // Optional
  linkedin_url?: string; // Optional
  business_address: string;
  ideal_referral_target?: string; // Optional - Advanced Networking Profile
  referral_triggers?: string; // Optional - Advanced Networking Profile
  logo_file: File | null;
  chapter_id: string;
  category_id: string;
  appointment_slot_id: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface LeadInquiryFormData {
  visitor_name: string;
  visitor_email: string;
  visitor_phone?: string;
  message: string;
  target_member_id: string;
}

export interface AdminApprovalData {
  profile_id: string;
  status: 'approved' | 'rejected';
  membership_fee_paid?: boolean;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Image Optimization Round-Trip
*For any* uploaded image file (logo, gallery image), processing through the Image_Optimizer should produce a WebP file with size ≤ 250KB, maximum dimension ≤ 1200px, and return a valid File object ready for upload.

**Validates: Requirements 1.2, 5.1-5.5, 12.3**

### Property 2: Pending Profile Invisibility
*For any* database query for public member listings (directories, search results, sitemaps), profiles with status='pending' should be excluded from results.

**Validates: Requirements 1.14, 3.3, 3.6**

### Property 3: Dynamic Admin Routing for Appointments
*For any* chapter selection during onboarding, if the chapter has an assigned Chapter_Admin, the calendar should display that Chapter_Admin's availability; otherwise, it should display the Super_Admin's availability.

**Validates: Requirements 1.4, 1.5, 1.23, 1.24**

### Property 4: Calendar Slot Filtering
*For any* calendar display, time slots should exclude (a) slots marked as occupied by existing bookings, and (b) slots marked as unavailable by the administrator.

**Validates: Requirements 1.6, 1.7, 1.26, 1.27**

### Property 5: Chapter-Category Exclusivity Invariant
*For any* chapter-category pair, at most one profile with status='approved' should exist. When validating a new application or approval, the system should reject if an approved member already exists for that combination.

**Validates: Requirements 1.8, 1.9, 8.1-8.6**

### Property 6: Appointment Slot State Transition
*For any* onboarding form submission, the selected appointment slot should transition from is_occupied=false to is_occupied=true. If the application is rejected, the slot should transition back to is_occupied=false.

**Validates: Requirements 1.13, 1.21**

### Property 7: Membership Fee Prerequisite for Approval
*For any* profile approval operation, the action should only succeed if membership_fee_paid=true. Attempting to approve with membership_fee_paid=false should fail with a validation error.

**Validates: Requirements 1.18**

### Property 8: Approval State Visibility Toggle
*For any* profile, when status changes from 'pending' to 'approved', the profile should immediately appear in public queries, search results, and sitemaps. When status is 'pending' or 'rejected', it should not appear.

**Validates: Requirements 1.19, 1.14**

### Property 9: Leave Management Round-Trip
*For any* time slot, marking it as unavailable should remove it from applicant calendar views. Re-enabling the slot (if not occupied) should restore it to available status in the calendar.

**Validates: Requirements 1.28**

### Property 10: Role-Based Query Scoping - Chapter Admin
*For any* authenticated user with role='chapter_admin', database queries for profiles and lead inquiries should return only records where chapter_id matches the admin's assigned chapter.

**Validates: Requirements 9.4, 7.3**

### Property 11: Role-Based Query Scoping - Public Visitor
*For any* unauthenticated query (public visitor), database reads should return only records with status='approved'. Insert operations for inquiries and contact forms should be allowed.

**Validates: Requirements 9.1, 9.2**

### Property 12: Role-Based Query Scoping - Member
*For any* authenticated user with role='member', queries for lead inquiries should return only records where target_member_id matches their ID and status='approved'.

**Validates: Requirements 9.3**

### Property 13: Role-Based Query Scoping - Super Admin
*For any* authenticated user with role='super_admin', database queries should bypass all chapter and status filters, returning all records.

**Validates: Requirements 9.5**

### Property 14: Cross-Profile Update Prevention
*For any* authenticated member, attempts to update another member's profile should be rejected at the database level via RLS policy.

**Validates: Requirements 9.6**

### Property 15: Lead Mediation Workflow Visibility
*For any* lead inquiry with status='pending', the inquiry should be visible to the target member's Chapter_Admin and all Super_Admins, but hidden from the target member. When status changes to 'approved', it should become visible to the target member.

**Validates: Requirements 7.3, 7.4, 7.5**

### Property 16: Lead Inquiry Chapter Association
*For any* lead inquiry submission, the chapter_id should be automatically set to match the target member's chapter_id.

**Validates: Requirements 7.2**

### Property 17: Dynamic Metadata Generation
*For any* dynamically generated page (/members/[id], /chapters/[slug], /categories/[slug]), the rendered HTML should contain <title>, <meta name="description">, and OpenGraph tags populated with database content specific to that entity.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 18: Structured Data Injection for Member Profiles
*For any* member profile page, the HTML should contain a <script type="application/ld+json"> element with LocalBusiness or ProfessionalService schema including business_name, category, chapter location, and parent area.

**Validates: Requirements 4.5**

### Property 19: Semantic HTML Structure
*For any* rendered page, the document should contain exactly one <main> element, proper heading hierarchy (single h1, nested h2-h6), and semantic landmarks (<header>, <footer>, <nav>).

**Validates: Requirements 4.7**

### Property 20: Sitemap Dynamic Content Inclusion
*For any* sitemap.xml generation, the output should include URLs for all areas, all chapters, all categories, and all members with status='approved', queried dynamically from the database.

**Validates: Requirements 4.6**

### Property 21: Next.js Image Component Attributes
*For any* rendered <Image> component, the element should have explicit width and height attributes. For above-the-fold images, the priority attribute should be set to true. All images should have meaningful alt text.

**Validates: Requirements 5.7, 5.8, 5.9**

### Property 22: Featured Categories Display
*For any* Categories navigation dropdown, the system should display categories where is_featured=true, limited to the top 5, plus a "View All Categories" link.

**Validates: Requirements 6.8, 10.3, 10.4**

### Property 23: Authenticated Navigation Visibility
*For any* header render, the "Start a Chapter" navigation tab should be visible if and only if the user is authenticated. The profile section should display if and only if the user is authenticated.

**Validates: Requirements 6.9, 6.10, 6.11**

### Property 24: Responsive Header Transformation
*For any* viewport width < 900px, the navigation header should hide desktop navigation buttons and display a mobile hamburger menu toggle. Tapping the toggle should expand/collapse the full navigation menu.

**Validates: Requirements 6.12, 14.1-14.3**

### Property 25: Global Search Filtering
*For any* search query (homepage or dedicated search), results should include only members with status='approved', matching the query against full_name, business_name, or category name across all areas and chapters.

**Validates: Requirements 3.2, 3.3, 13.4, 13.5, 13.6**

### Property 26: Directory Filtering by Geography and Category
*For any* chapter detail page, only approved members with matching chapter_id should display. For any category detail page, only approved members with matching category_id should display.

**Validates: Requirements 3.4, 3.5**

### Property 27: URL-Safe Slug Generation
*For any* category or area creation/update, the system should generate a URL-safe slug from the name by converting to lowercase, replacing spaces with hyphens, and removing special characters.

**Validates: Requirements 10.1, 10.7**

### Property 28: Referential Integrity for Deletions
*For any* category deletion attempt, if approved members are associated with that category, the operation should fail. For any area deletion attempt, if chapters are nested under that area, the operation should fail.

**Validates: Requirements 10.5, 10.12**

### Property 29: Form Validation - Required Fields
*For any* form submission (onboarding, contact, lead inquiry), all fields marked as required should be validated as non-empty before enabling submission. Email fields should additionally validate format using standard email regex.

**Validates: Requirements 1.10, 11.5, 11.7**

### Property 30: Gallery Image Alt Text Requirement
*For any* gallery image upload, the system should require alt text input before allowing the save operation. When rendering gallery images, the alt attribute should contain the admin-provided text.

**Validates: Requirements 12.2, 12.6**

### Property 31: Gallery Post Chronological Ordering
*For any* gallery page render, posts should be ordered by created_at in descending order (newest first).

**Validates: Requirements 12.4**

### Property 32: Server Action Input Validation
*For any* Server Action execution, input data should be validated before database operations. On validation or execution errors, the return value should be a structured error object with descriptive message.

**Validates: Requirements 15.2, 15.5**

### Property 33: Server Action Cache Revalidation
*For any* successful Server Action mutation, affected Next.js page caches should be revalidated using revalidatePath() or revalidateTag().

**Validates: Requirements 15.4**

### Property 34: Supabase Client Key Selection
*For any* Server Action, database operations requiring privileged access (create users, bypass RLS) should use the service role key. Public operations should use the anon key.

**Validates: Requirements 15.3**

### Property 35: Mobile Touch Target Sizing
*For any* interactive element (buttons, links, form controls) on mobile viewports, the minimum touch target size should be 44px × 44px to ensure accessibility.

**Validates: Requirements 14.4**

### Property 36: Mobile Form Layout
*For any* form rendered on mobile viewports (width < 768px), form fields should stack vertically with full width for optimal usability.

**Validates: Requirements 14.5**

### Property 37: Environment Variable Absolute URL Generation
*For any* generated absolute URL (canonical links, OpenGraph URLs, email links), the base domain should be constructed using the NEXT_PUBLIC_SITE_URL environment variable.

**Validates: Requirements 17.6**

### Property 38: Brand Color Palette Configuration
*For any* Tailwind CSS configuration, the theme extension should include all six brand colors (brand-navy, brand-sapphire, brand-gold, brand-champagne, brand-white, brand-silver) with their correct HEX values, making utility classes accessible throughout the codebase.

**Validates: Requirements 18.1, 18.2, 18.3, 18.10**

## Error Handling

### Client-Side Validation

**Form Validation**
- All required fields validated before form submission
- Email format validation using regex pattern
- Phone number format validation (Indian +91 format)
- URL format validation for website and LinkedIn fields
- File type validation (only images: jpg, jpeg, png, webp)
- File size pre-validation before optimization (warn if > 5MB source)

**User Feedback**
- Inline error messages below form fields
- Toast notifications for success/error states
- Loading states on buttons during async operations
- Disabled submit buttons until validation passes

### Server-Side Error Handling

**Database Constraint Violations**
```typescript
try {
  await supabase.from('profiles').insert(profileData);
} catch (error) {
  if (error.code === '23505') { // Unique constraint violation
    return { error: 'A member already exists for this category in the selected chapter.' };
  }
  throw error;
}
```

**Authentication Errors**
- Session expiration: Redirect to login with return URL
- Permission denied: 403 error page with explanation
- Invalid credentials: Clear error message without exposing security details

**API Route Error Responses**
```typescript
export async function POST(request: Request) {
  try {
    // Process request
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
```

**Webhook Verification Failures**
- Log failed webhook attempts with timestamp and payload hash
- Return 401 for invalid signatures
- Alert admin dashboard for suspicious webhook activity

### Graceful Degradation

**Image Upload Failures**
- Retry upload up to 3 times with exponential backoff
- Allow profile creation without logo if upload fails
- Display clear error message with option to retry

**Search Failures**
- Fallback to cached results if database query times out
- Display partial results with warning message
- Log search failures for debugging

**Calendar Loading Failures**
- Display static contact form if calendar widget fails to load
- Provide email fallback for appointment requests
- Log widget failures for monitoring

## Testing Strategy

The UCCI Platform will employ a dual testing approach combining traditional unit tests for specific scenarios and property-based tests for comprehensive coverage of universal correctness properties.

### Property-Based Testing

**Testing Library**: We will use `fast-check` (for TypeScript/JavaScript) as our property-based testing framework. Fast-check provides excellent integration with Jest/Vitest and supports complex generator composition.

**Configuration**: Each property test will run a minimum of 100 iterations with randomly generated inputs to ensure comprehensive coverage.

**Test Organization**: Property tests will be co-located with implementation files using `.property.test.ts` suffix to distinguish from unit tests.

**Tagging Convention**: Each property test will include a comment tag linking back to the design property:
```typescript
/**
 * Feature: ucci-platform, Property 1: Chapter-Category Exclusivity Invariant
 * Validates: Requirements 1.8, 1.9, 8.1-8.6
 */
```

### Unit Testing

Unit tests will complement property tests by focusing on:
- Specific edge cases and boundary conditions
- Integration points between components
- Error handling scenarios
- Mocked external dependencies (Supabase, webhooks)

**Testing Framework**: Jest with TypeScript support or Vitest for faster execution

**Coverage Targets**:
- Minimum 80% code coverage for business logic
- 100% coverage for critical security functions (RLS checks, role validation)
- 90% coverage for data transformation utilities

### End-to-End Testing

**Framework**: Playwright for cross-browser testing

**Critical User Journeys**:
- Complete onboarding flow (form fill → appointment selection → submission)
- Admin approval workflow (review → fee toggle → approval)
- Public member search and profile viewing
- Lead inquiry submission and mediation
- Gallery post creation with multiple images

**Accessibility Testing**: Automated checks using Axe-core within Playwright tests

### SEO Testing

**Metadata Validation**:
- Verify dynamic metadata generation on all dynamic routes
- Check OpenGraph tags presence and content
- Validate canonical URLs point to production domain

**Structured Data Validation**:
- Use Google Rich Results Test API to validate JSON-LD schemas
- Verify LocalBusiness schema contains required fields
- Check WebSite schema includes sitelinks search box

**Sitemap Testing**:
- Verify sitemap.xml contains all expected URL patterns
- Check that pending profiles are excluded from sitemap
- Validate lastmod timestamps are accurate

### Performance Testing

**Core Web Vitals Monitoring**:
- Lighthouse CI in GitHub Actions on every PR
- Minimum scores: Performance 90+, Accessibility 95+, SEO 100
- Real User Monitoring (RUM) in production using Vercel Analytics or similar

**Load Testing**:
- Simulate 100 concurrent users during onboarding flow
- Test database query performance under load
- Verify Netlify Functions complete within 10s timeout

### Security Testing

**Authentication Testing**:
- Verify protected routes reject unauthenticated requests
- Test session expiration and renewal
- Validate role-based access control enforcement

**SQL Injection Prevention**:
- Use parameterized queries exclusively
- Test Supabase RLS policies prevent unauthorized access
- Verify input sanitization on all form fields

**XSS Prevention**:
- Test that user-generated content (bios, business names) is properly escaped
- Verify CSP headers block inline scripts
- Check for proper sanitization of rich text fields

This comprehensive testing strategy ensures the UCCI Platform maintains high quality, security, and performance standards while providing clear traceability from requirements through properties to test implementation.
