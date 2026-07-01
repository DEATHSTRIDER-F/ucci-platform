# Requirements Document: UCCI Platform

## Introduction

The UCCI Platform is an SEO-optimized digital brochure, role-based admin panel, and referral networking platform for UCCI (a business networking organization inspired by the BNI model). The system enables professionals to network within geographical chapters, exchange business referrals, and connect with potential clients while maintaining strict exclusivity rules (one professional per category per chapter). The platform prioritizes search engine optimization, web performance, and Core Web Vitals to maximize organic discovery.

## Glossary

- **UCCI_System**: The complete web platform including public pages, authentication, and role-based dashboards
- **Public_Visitor**: An unauthenticated user browsing the website
- **Member**: An authenticated professional with an approved profile representing a specific category within a chapter
- **Chapter_Admin**: An authenticated user with administrative privileges scoped to a specific chapter
- **Super_Admin**: An authenticated user with global administrative privileges across all chapters and areas
- **Area**: A parent geographical region node in a strict two-tier hierarchy (Baseline: Pune with 5 chapters; PCMC with 2 chapters)
- **Chapter**: A child node within a parent Area (Pune Chapters: East, West, North, South, Central; PCMC Chapters: East, West)
- **Category**: A professional classification or business type (e.g., Chartered Accountant, IT Consultant)
- **Lead_Inquiry**: A service request submitted by a potential client through a member's profile page
- **Profile_Status**: The approval state of a member profile, either 'pending' or 'approved'
- **Member_Profile_Application**: The complete onboarding form containing business details required for directory listing
- **Image_Optimizer**: The client-side utility that converts and compresses images to WebP format under 250KB
- **Admin_Curated_Onboarding**: The workflow where Super_Admin creates base member accounts before members can populate profile details
- **Membership_Fee_Paid**: A boolean field tracking offline payment of the ₹10,000 recurring membership fee
- **Appointment_Webhook**: The background API endpoint that processes booking confirmation payloads from scheduling systems

## Requirements

### Requirement 1: Unified Onboarding, Dynamic Slot Availability, and Account Activation Workflow

**User Story:** As a prospective professional, I want to complete my profile application and schedule an interview in a single workflow, so that I can efficiently secure my exclusive seat in a UCCI chapter.

#### Acceptance Criteria

**Phase 1: Applicant Intake & Booking**

1. WHEN a prospective professional accesses the "Join / Start a Chapter" page, THE UCCI_System SHALL display a unified form with fields for Company Full Name, Brand Tagline, Micro-Classification, Professional Biography, Primary Phone, External Website (marked as Optional field), LinkedIn Profile URL (marked as Optional field), and Official Business Address
2. WHEN the onboarding form renders, THE UCCI_System SHALL display a collapsible accordion component labeled "Advanced Networking Profile (Optional)" at the bottom of the form
3. WHEN a prospective professional expands the "Advanced Networking Profile (Optional)" accordion, THE UCCI_System SHALL reveal fields for ideal_referral_target and referral_triggers
4. WHEN the onboarding form validates submission, THE UCCI_System SHALL treat ideal_referral_target and referral_triggers as optional nullable fields that do not block submission if left empty
5. WHEN a prospective professional uploads branding assets (logo) on the onboarding form, THE Image_Optimizer SHALL convert the image to WebP format and compress to under 250KB
3. WHEN the onboarding form renders, THE UCCI_System SHALL display an interactive calendar view showing available interview time slots
4. WHEN a prospective professional selects a chapter that has an assigned Chapter_Admin, THE UCCI_System SHALL display the available time slots of that specific Chapter_Admin
5. WHEN a prospective professional selects a chapter without an assigned Chapter_Admin, THE UCCI_System SHALL display the available time slots of the global Super_Admin
6. WHEN the calendar displays available slots, THE UCCI_System SHALL exclude time slots flagged as 'occupied' by existing bookings
7. WHEN the calendar displays available slots, THE UCCI_System SHALL exclude dates and time intervals marked as unavailable by the assigned administrator
8. WHEN a prospective professional selects a time slot and category, THE UCCI_System SHALL validate against existing approved members in that chapter-category pair
9. IF an approved member exists with matching chapter_id and category_id, THEN THE UCCI_System SHALL reject the application and display a validation warning explaining the exclusivity rule
10. WHEN a prospective professional completes all required fields and selects a time slot, THE UCCI_System SHALL enable the Submit button

**Phase 2: State Pending & Reservation**

11. WHEN a prospective professional submits the onboarding form, THE UCCI_System SHALL create a profiles record with status set to 'pending' and role set to 'member'
12. WHEN a profile is created with status 'pending', THE UCCI_System SHALL generate Supabase Auth credentials and send login details to the applicant's email
13. WHEN a profile is created, THE UCCI_System SHALL flag the selected time slot as 'occupied' in the system ledger for the assigned administrator
14. WHEN a profile has status 'pending', THE UCCI_System SHALL exclude it from public directories, search results, and sitemaps
15. WHEN an applicant with status 'pending' logs in, THE UCCI_System SHALL display a message indicating their application is under review

**Phase 3: The Vetting Call & Payment Gate**

16. WHEN a Chapter_Admin or Super_Admin views pending applications for their assigned chapter, THE UCCI_System SHALL display all profiles with status 'pending' including scheduled appointment timestamps
17. WHEN an administrator conducts the vetting call and receives the ₹10,000 offline registration fee, THE administrator SHALL toggle membership_fee_paid to true in the admin console
18. WHEN an administrator approves an application, THE UCCI_System SHALL require that membership_fee_paid is true before allowing status change to 'approved'
19. WHEN an administrator sets a profile status to 'approved', THE UCCI_System SHALL include the member in public directories, search results, and sitemaps immediately
20. WHEN an administrator rejects an application, THE UCCI_System SHALL archive the profile record and remove it from pending queues
21. WHEN an administrator rejects an application, THE UCCI_System SHALL release the occupied time slot back to available status

**Phase 4: Admin Creation and Assignment**

22. WHEN a Super_Admin creates a Chapter_Admin account, THE UCCI_System SHALL require assignment of a specific chapter_id
23. WHEN a Super_Admin assigns a Chapter_Admin to a chapter, THE UCCI_System SHALL update the routing logic to display that Chapter_Admin's availability for applications to that chapter
24. WHEN a Super_Admin removes a Chapter_Admin assignment, THE UCCI_System SHALL revert the routing logic to display Super_Admin availability for that chapter

**Phase 5: Availability & Leave Management**

25. WHEN an administrator accesses the availability management interface, THE UCCI_System SHALL display a calendar showing all operational time slots as available by default
26. WHEN an administrator marks specific dates or time intervals as unavailable, THE UCCI_System SHALL remove those slots from the applicant-facing calendar view immediately
27. WHEN an administrator marks a date range as leave/blackout period, THE UCCI_System SHALL exclude all slots within that range from applicant booking options
28. WHEN an administrator re-enables a previously blocked time slot, THE UCCI_System SHALL restore it to the available slots pool if not occupied by an existing booking
29. WHEN the UCCI_System displays administrator availability, THE UCCI_System SHALL follow an 'open-by-default' logic where all standard operational slots are available unless explicitly marked occupied or unavailable

### Requirement 2: User Authentication and Session Management

**User Story:** As a member, I want to securely log in and manage my session, so that I can access my dashboard and protected features.

#### Acceptance Criteria

1. WHEN a member accesses the login page, THE UCCI_System SHALL display email and password input fields
2. WHEN a member submits valid credentials, THE UCCI_System SHALL authenticate via Supabase Auth and establish a secure session
3. WHEN authentication succeeds, THE UCCI_System SHALL retrieve the user's role and status from the profiles table
4. WHEN a member logs out, THE UCCI_System SHALL terminate the session and clear authentication tokens
5. WHEN a Public_Visitor attempts to access protected routes, THE UCCI_System SHALL redirect to the login page
6. WHEN an authenticated member accesses protected routes, THE UCCI_System SHALL verify the session token before rendering content

### Requirement 3: Public Member Directory and Search

**User Story:** As a public visitor, I want to search and browse approved member profiles, so that I can find professionals offering specific services in my area.

#### Acceptance Criteria

1. WHEN a Public_Visitor accesses the homepage search bar, THE UCCI_System SHALL display a search input accepting text queries
2. WHEN a Public_Visitor submits a search query, THE UCCI_System SHALL return members with status 'approved' matching the query by name, business name, or category
3. WHEN search results are displayed, THE UCCI_System SHALL show only members with status 'approved'
4. WHEN a Public_Visitor navigates to a chapter page, THE UCCI_System SHALL display all approved members within that chapter
5. WHEN a Public_Visitor navigates to a category page, THE UCCI_System SHALL display all approved members within that category across all chapters
6. WHEN the UCCI_System displays member profiles in search results or directories, THE UCCI_System SHALL exclude profiles with status 'pending'

### Requirement 4: SEO Metadata and Structured Data

**User Story:** As a business owner, I want my member profile to be discoverable via search engines, so that I can attract organic traffic and potential clients.

#### Acceptance Criteria

1. WHEN the UCCI_System renders a member profile page at `/members/[id]`, THE UCCI_System SHALL generate dynamic metadata including page title, meta description, and OpenGraph properties based on the member's database record
2. WHEN the UCCI_System renders a chapter page at `/chapters/[slug]`, THE UCCI_System SHALL generate dynamic metadata including the chapter name and parent area
3. WHEN the UCCI_System renders a category page at `/categories/[slug]`, THE UCCI_System SHALL generate dynamic metadata including the category name and member count
4. WHEN the UCCI_System renders the homepage, THE UCCI_System SHALL inject JSON-LD structured data using Organization and WebSite schemas
5. WHEN the UCCI_System renders a member profile page, THE UCCI_System SHALL inject JSON-LD structured data using LocalBusiness or ProfessionalService schema with business name, category, chapter location, and parent area
6. WHEN the UCCI_System generates a sitemap, THE UCCI_System SHALL query Supabase to list all public categories, chapter paths, and approved member profile pages
7. WHEN the UCCI_System renders any page, THE UCCI_System SHALL use semantic HTML elements including `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`, and heading hierarchy

### Requirement 5: Image Optimization Pipeline

**User Story:** As a platform administrator, I want all uploaded images to be optimized for web performance, so that the site maintains excellent Core Web Vitals scores and fast load times.

#### Acceptance Criteria

1. WHEN any user uploads an image via a file input, THE Image_Optimizer SHALL intercept the file before upload to Supabase Storage
2. WHEN the Image_Optimizer receives an image file, THE Image_Optimizer SHALL convert the image to WebP format using HTML5 Canvas or Web Workers
3. WHEN the Image_Optimizer converts an image, THE Image_Optimizer SHALL compress the file to a maximum size of 250KB
4. WHEN the Image_Optimizer resizes an image, THE Image_Optimizer SHALL constrain dimensions to a maximum bounding box of 1200px while preserving aspect ratio
5. WHEN the Image_Optimizer completes processing, THE Image_Optimizer SHALL return a File object ready for upload
6. WHEN the UCCI_System uploads or updates an image to Supabase Storage, THE UCCI_System SHALL use an upsert operation
7. WHEN the UCCI_System renders images using Next.js Image component, THE UCCI_System SHALL specify explicit width and height dimensions
8. WHEN the UCCI_System renders above-the-fold images, THE UCCI_System SHALL set the priority flag to true
9. WHEN the UCCI_System renders any image, THE UCCI_System SHALL provide semantic alt text

### Requirement 6: Global Navigation Header

**User Story:** As a site visitor, I want a consistent navigation header across all pages, so that I can easily access key sections and features.

#### Acceptance Criteria

1. WHEN the UCCI_System renders any page, THE UCCI_System SHALL display a pinned sticky header at the top of the viewport
2. WHEN the header renders, THE UCCI_System SHALL display the organization logo on the top left using Next.js Image component with explicit dimensions and priority flag
3. WHEN the header renders, THE UCCI_System SHALL display navigation tabs in the following order: Home, About UCCI, Chapters, Categories, Start a Chapter, Contact Us, Gallery
4. WHEN a user hovers over the About UCCI tab, THE UCCI_System SHALL display a dropdown menu with sub-links "Our Story" and "How It Works" linking to `/about#how-it-works`
5. WHEN a user hovers over the Chapters tab, THE UCCI_System SHALL display a cascading dropdown grouped by parent Areas (Pune, PCMC) with nested Chapters
6. WHEN the Chapters dropdown renders the Pune area, THE UCCI_System SHALL display nested chapters: East, West, North, South, Central
7. WHEN the Chapters dropdown renders the PCMC area, THE UCCI_System SHALL display nested chapters: East, West
8. WHEN a user hovers over the Categories tab, THE UCCI_System SHALL display a dropdown with the top 5 categories where is_featured is true, plus a "View All Categories" button linking to `/categories`
9. WHEN a user is not authenticated, THE UCCI_System SHALL hide the "Start a Chapter" navigation tab
10. WHEN a user is authenticated, THE UCCI_System SHALL display the "Start a Chapter" navigation tab
11. WHEN an authenticated user views the header, THE UCCI_System SHALL display a profile section on the top right with avatar, full name, and email address
12. WHEN the viewport width is less than 900px, THE UCCI_System SHALL hide desktop navigation buttons and display a mobile hamburger menu toggle

### Requirement 7: Lead Inquiry Mediation Workflow

**User Story:** As a chapter admin, I want to review and approve lead inquiries before they reach members, so that I can ensure quality control and prevent spam.

#### Acceptance Criteria

1. WHEN a Public_Visitor submits a service request form on a member profile page, THE UCCI_System SHALL create a Lead_Inquiry record with status set to 'pending'
2. WHEN a Lead_Inquiry is created, THE UCCI_System SHALL associate it with the target member's chapter_id
3. WHEN a Lead_Inquiry has status 'pending', THE UCCI_System SHALL display it in the dashboards of the Chapter_Admin for that chapter and all Super_Admins
4. WHEN a Lead_Inquiry has status 'pending', THE UCCI_System SHALL not display it to the target Member
5. WHEN a Chapter_Admin or Super_Admin approves a Lead_Inquiry, THE UCCI_System SHALL update status to 'approved' and display the inquiry in the target Member's dashboard
6. WHEN a Chapter_Admin or Super_Admin rejects a Lead_Inquiry, THE UCCI_System SHALL update status to 'rejected' and archive it without notifying the target Member
7. WHEN a Lead_Inquiry status changes to 'approved', THE UCCI_System SHALL send a server-side email notification to the target Member

### Requirement 8: Chapter Exclusivity Enforcement

**User Story:** As a super admin, I want to ensure only one member per professional category exists in each chapter, so that we maintain the BNI-style exclusivity model and prevent internal competition.

#### Acceptance Criteria

1. WHEN the UCCI_System creates the profiles table, THE UCCI_System SHALL establish a composite unique index on (chapter_id, category_id) where status is 'approved'
2. WHEN a Super_Admin attempts to assign a chapter-category pair to a new member, THE UCCI_System SHALL query for existing approved members with matching chapter_id and category_id
3. IF an approved member exists with matching chapter_id and category_id, THEN THE UCCI_System SHALL reject the assignment at the database transaction level
4. WHEN the database rejects a duplicate chapter-category assignment, THE UCCI_System SHALL display a frontend validation warning explaining the exclusivity rule
5. WHEN a Super_Admin creates a member account, THE UCCI_System SHALL display existing approved members in the selected chapter to verify category exclusivity
6. WHEN the UCCI_System validates chapter-category uniqueness, THE UCCI_System SHALL only enforce the constraint for members with status 'approved'

### Requirement 9: Role-Based Access Control

**User Story:** As a system administrator, I want strict role-based permissions enforced at the database level, so that users can only access data appropriate to their role.

#### Acceptance Criteria

1. WHEN the UCCI_System configures Row-Level Security policies, THE UCCI_System SHALL restrict Public_Visitors to reading only records where status is 'approved'
2. WHEN a Public_Visitor attempts to insert a Lead_Inquiry or contact inquiry, THE UCCI_System SHALL allow the insert operation
3. WHEN a Member queries Lead_Inquiries, THE UCCI_System SHALL return only records where target_member_id matches the authenticated user's ID and status is 'approved'
4. WHEN a Chapter_Admin queries profiles or Lead_Inquiries, THE UCCI_System SHALL return only records where chapter_id matches the admin's assigned chapter
5. WHEN a Super_Admin queries any table, THE UCCI_System SHALL bypass all chapter-scoped filters and return all records
6. WHEN a Member attempts to update another member's profile, THE UCCI_System SHALL reject the operation via RLS policy
7. WHEN a Chapter_Admin attempts to approve profiles outside their assigned chapter, THE UCCI_System SHALL reject the operation via RLS policy
8. WHEN implementing Row-Level Security policies, THE UCCI_System SHALL use explicit relational validation through EXISTS subqueries rather than abstract inheritance patterns
9. WHEN a Chapter_Admin attempts to modify gallery_images records, THE UCCI_System SHALL validate through cross-table JOIN that the parent gallery_posts record matches the admin's assigned chapter_id
10. WHEN RLS policies require relational validation across tables, THE UCCI_System SHALL explicitly JOIN the required tables within the USING clause to establish permission boundaries

### Requirement 10: Category Management and Area Administration

**User Story:** As a super admin, I want to create and manage categories, areas, and chapters, so that I can organize professional classifications and expand UCCI's geographical presence.

#### Acceptance Criteria

1. WHEN a Super_Admin creates a category, THE UCCI_System SHALL generate a URL-safe slug from the category name
2. WHEN a Super_Admin updates a category, THE UCCI_System SHALL allow modification of name, slug, is_featured flag, meta_description, and alt_text
3. WHEN a Super_Admin sets is_featured to true for a category, THE UCCI_System SHALL display that category in the header navigation dropdown
4. WHEN the header Categories dropdown renders, THE UCCI_System SHALL display the top 5 categories where is_featured is true
5. WHEN a Super_Admin deletes a category, THE UCCI_System SHALL prevent deletion if any approved members are associated with that category
6. WHEN a Public_Visitor navigates to `/categories`, THE UCCI_System SHALL display all categories with member counts
7. WHEN a Super_Admin creates a new Area, THE UCCI_System SHALL generate a URL-safe slug and initialize the parent node
8. WHEN a Super_Admin creates a new Chapter, THE UCCI_System SHALL require selection of a parent Area via area_id foreign key
9. WHEN the UCCI_System initializes the database, THE UCCI_System SHALL seed Area "Pune" with Chapters: East, West, North, South, Central
10. WHEN the UCCI_System initializes the database, THE UCCI_System SHALL seed Area "PCMC" with Chapters: East, West
11. WHEN a Super_Admin updates an Area, THE UCCI_System SHALL allow modification of name and slug
12. WHEN a Super_Admin deletes an Area, THE UCCI_System SHALL prevent deletion if any Chapters are nested under that Area

### Requirement 11: Contact Us System

**User Story:** As a public visitor, I want to send a message to UCCI administrators, so that I can ask questions or provide feedback.

#### Acceptance Criteria

1. WHEN a Public_Visitor accesses the Contact Us page, THE UCCI_System SHALL display a form with fields for name, email, subject, and message
2. WHEN the Contact Us page renders, THE UCCI_System SHALL display the official UCCI address "Office No 202, Commercial Building 4 HM Royal Next To Talab Masjid Kondhwa Pune - 411048"
3. WHEN the Contact Us page renders, THE UCCI_System SHALL display the primary contact phone number "8600241900"
4. WHEN a visitor submits the Contact Us form, THE UCCI_System SHALL create a contact_inquiries record
5. WHEN a contact inquiry is submitted, THE UCCI_System SHALL validate that name, email, and message fields are not empty
6. WHEN a Super_Admin accesses the admin dashboard, THE UCCI_System SHALL display all contact inquiries with submission timestamps
7. WHEN the UCCI_System validates the email field, THE UCCI_System SHALL ensure the value follows standard email format

### Requirement 12: Gallery System

**User Story:** As a super admin, I want to create photo gallery posts with multiple images, so that I can showcase UCCI events and build community engagement.

#### Acceptance Criteria

1. WHEN a Super_Admin creates a gallery post, THE UCCI_System SHALL display fields for title, text content, and multiple image uploads
2. WHEN a Super_Admin uploads images for a gallery post, THE UCCI_System SHALL require an image description or alt text for each image before saving
3. WHEN a Super_Admin uploads gallery images, THE Image_Optimizer SHALL process each image to WebP format under 250KB
4. WHEN a Public_Visitor views the Gallery page, THE UCCI_System SHALL display all gallery posts in reverse chronological order
5. WHEN a Public_Visitor views a gallery post, THE UCCI_System SHALL display a responsive carousel or slider showing all attached images
6. WHEN the UCCI_System renders gallery images, THE UCCI_System SHALL include the admin-provided alt text in the img element
7. WHEN a Chapter_Admin attempts to modify gallery images, THE UCCI_System SHALL validate via cross-table relational check that the parent gallery_posts record matches the admin's assigned chapter_id
8. WHEN a Public_Visitor attempts to insert, update, or delete gallery_images records, THE UCCI_System SHALL reject the operation via Row-Level Security policy
9. WHEN validating gallery image permissions, THE UCCI_System SHALL use explicit EXISTS subqueries joining gallery_posts and profiles tables to prevent unauthorized mutations

### Requirement 13: Homepage Hero and Search

**User Story:** As a public visitor, I want to search for professionals from the homepage, so that I can quickly find service providers without navigating through multiple pages.

#### Acceptance Criteria

1. WHEN a Public_Visitor accesses the homepage, THE UCCI_System SHALL display a hero section with a carousel
2. WHEN the hero carousel renders, THE UCCI_System SHALL transition between slides smoothly
3. WHEN the homepage renders, THE UCCI_System SHALL overlay a prominent search bar on the hero section
4. WHEN a Public_Visitor enters a search query on the homepage, THE UCCI_System SHALL search across member names, business names, and categories
5. WHEN homepage search results are displayed, THE UCCI_System SHALL show members from all Areas and Chapters matching the query
6. WHEN homepage search executes, THE UCCI_System SHALL return only members with status 'approved'

### Requirement 14: Responsive Design and Mobile Optimization

**User Story:** As a mobile user, I want the platform to be fully functional and visually optimized on my device, so that I can access all features without usability issues.

#### Acceptance Criteria

1. WHEN the viewport width is less than 900px, THE UCCI_System SHALL adapt the navigation header to a mobile layout
2. WHEN the mobile layout activates, THE UCCI_System SHALL display a hamburger menu icon
3. WHEN a mobile user taps the hamburger icon, THE UCCI_System SHALL expand a full navigation menu
4. WHEN any page renders on mobile viewports, THE UCCI_System SHALL ensure all interactive elements are touch-friendly with minimum 44px touch targets
5. WHEN forms render on mobile, THE UCCI_System SHALL stack form fields vertically for optimal usability
6. WHEN images render on mobile, THE UCCI_System SHALL serve appropriately sized images based on viewport width

### Requirement 15: Data Persistence and Server Actions

**User Story:** As a developer, I want to use Next.js Server Actions for data mutations, so that I can leverage server-side rendering benefits while maintaining type safety.

#### Acceptance Criteria

1. WHEN the UCCI_System performs data mutations, THE UCCI_System SHALL use Next.js Server Actions or TanStack Query
2. WHEN a Server Action executes, THE UCCI_System SHALL validate input data before database operations
3. WHEN a Server Action interacts with Supabase, THE UCCI_System SHALL use the appropriate service role key for privileged operations or anon key for public operations
4. WHEN a Server Action completes successfully, THE UCCI_System SHALL revalidate affected page caches
5. WHEN a Server Action encounters an error, THE UCCI_System SHALL return structured error messages to the client

### Requirement 16: Performance and Core Web Vitals

**User Story:** As a site visitor, I want pages to load quickly with minimal layout shift, so that I have a smooth browsing experience.

#### Acceptance Criteria

1. WHEN the UCCI_System renders any page, THE UCCI_System SHALL use Next.js Server Components for initial data pre-rendering
2. WHEN the UCCI_System loads images, THE UCCI_System SHALL prevent Cumulative Layout Shift by specifying explicit dimensions
3. WHEN the UCCI_System renders above-the-fold content, THE UCCI_System SHALL prioritize loading critical resources
4. WHEN the UCCI_System generates pages, THE UCCI_System SHALL aim for Largest Contentful Paint under 2.5 seconds
5. WHEN the UCCI_System handles user interactions, THE UCCI_System SHALL aim for First Input Delay under 100 milliseconds
6. WHEN the UCCI_System renders pages, THE UCCI_System SHALL aim for Cumulative Layout Shift score under 0.1

### Requirement 17: Deployment and Environment Configuration

**User Story:** As a DevOps engineer, I want clear deployment configurations for Netlify, so that I can deploy and maintain the production environment reliably.

#### Acceptance Criteria

1. WHEN the UCCI_System is deployed to Netlify, THE UCCI_System SHALL be compatible with @netlify/plugin-nextjs Runtime v5
2. WHEN Next.js Server Actions execute on Netlify, THE UCCI_System SHALL complete within Netlify Functions timeout limits
3. WHEN the project root contains a netlify.toml file, THE netlify.toml SHALL specify the build command as `npm run build`
4. WHEN the netlify.toml configures headers, THE netlify.toml SHALL enforce Content-Security-Policy, X-Robots-Tag, Cache-Control, and X-Content-Type-Options
5. WHEN environment variables are configured for production, THE UCCI_System SHALL require NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SITE_URL, and SUPABASE_SERVICE_ROLE_KEY
6. WHEN the UCCI_System generates absolute URLs, THE UCCI_System SHALL use NEXT_PUBLIC_SITE_URL for canonical and OpenGraph paths

### Requirement 18: Brand Color Palette and Design System

**User Story:** As a designer, I want a consistent, professional color palette applied across all pages, so that the platform reflects UCCI's elite business networking brand identity.

#### Acceptance Criteria

1. WHEN the Tailwind CSS configuration is initialized, THE UCCI_System SHALL define primary background colors with Deep Navy Blue (#0B132B) as brand-navy and Dark Sapphire (#1C2541) as brand-sapphire
2. WHEN the Tailwind CSS configuration is initialized, THE UCCI_System SHALL define accent colors with Metallic Gold (#D4AF37) as brand-gold and Warm Champagne (#F3E5AB) as brand-champagne
3. WHEN the Tailwind CSS configuration is initialized, THE UCCI_System SHALL define typography colors with Crisp White (#FFFFFF) as brand-white and Ice Silver (#E0E1DD) as brand-silver
4. WHEN any page renders, THE UCCI_System SHALL use brand-navy (#0B132B) for global page backgrounds, primary hero sections, and footer backgrounds
5. WHEN any page renders, THE UCCI_System SHALL use brand-sapphire (#1C2541) for card backgrounds, navbar containers, and alternating section blocks
6. WHEN any page renders, THE UCCI_System SHALL use brand-gold (#D4AF37) for brand logos, primary button backgrounds, critical typography headers, active navigation states, and border highlights
7. WHEN any page renders, THE UCCI_System SHALL use brand-champagne (#F3E5AB) for sub-headings, text inline badges, icon containers, and secondary border accents
8. WHEN any page renders, THE UCCI_System SHALL use brand-white (#FFFFFF) for main titles, primary button text over dark backgrounds, and critical body copy
9. WHEN any page renders, THE UCCI_System SHALL use brand-silver (#E0E1DD) for standard body paragraphs, form labels, footer text links, and secondary metadata
10. WHEN the Tailwind configuration extends the color theme, THE UCCI_System SHALL make utility classes bg-brand-navy, text-brand-gold, border-brand-sapphire, and similar variants accessible throughout the codebase
