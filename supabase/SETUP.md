# UCCI Platform — Supabase Setup Guide

## Prerequisites
- Supabase project created at [supabase.com](https://supabase.com)
- Your project URL and keys added to `.env.local`

## Step-by-step Setup

### 1. Run the Database Schema

Go to **Supabase Dashboard → SQL Editor** and run these files **in order**:

```
1. supabase/schema.sql   — Creates all tables, enums, RLS policies, triggers
2. supabase/seed.sql     — Inserts Areas, Chapters, Categories
3. supabase/storage.sql  — Creates the ucci-media bucket + storage RLS
4. supabase/auth.sql     — Creates the new-user trigger (auto-profile creation)
```

### 2. Configure Authentication

In **Supabase Dashboard → Authentication → Settings**:

- **Site URL**: Set to your deployment URL (e.g. `https://projectucci.netlify.app`)
- **Redirect URLs**: Add `https://projectucci.netlify.app/**`
- **Email Templates**: Customize as desired
- **Email Confirmations**: Enable for production

### 3. Create the Super Admin Account

After running the schema, create your super admin manually:

```sql
-- Step 1: Create the Supabase Auth user via the Dashboard
-- Go to: Authentication → Users → Add User

-- Step 2: Set the role to super_admin (replace with actual user ID)
UPDATE profiles
SET role = 'super_admin', status = 'approved', membership_fee_paid = true
WHERE email = 'your-superadmin@email.com';
```

### 4. Verify Storage Bucket

In **Supabase Dashboard → Storage**:
- Confirm `ucci-media` bucket exists and is **Public**
- The bucket will contain:
  - `logos/` — Member company logos (`{userId}.webp`)
  - `slides/` — Hero carousel slides (`{slideId}.webp`)
  - `gallery/` — Gallery images (`{postId}/{imageId}.webp`)

### 5. Environment Variables

Copy `.env.production.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...   ← NEVER expose this publicly
NEXT_PUBLIC_SITE_URL=https://projectucci.netlify.app
```

### 6. Deploy to Netlify

The `netlify.toml` is pre-configured. Simply:

1. Push to your GitHub repo
2. Connect the repo in Netlify
3. Add the environment variables in **Netlify → Site Settings → Environment Variables**
4. Deploy!

## Storage Layout

```
ucci-media/
├── logos/
│   └── {userId}.webp          ← Member business logo (upserted on update)
├── slides/
│   └── {slideId}.webp         ← Hero carousel slide (upserted on edit)
└── gallery/
    └── {postId}/
        └── {imageId}.webp     ← Gallery post images (upserted)
```

All images are:
- Automatically compressed to **sub-500KB**
- Converted to **WebP** format client-side before upload
- **Upserted** (not re-created) to avoid storage clutter

## Architecture Notes

- **Chapter Exclusivity**: Enforced via partial unique index `profiles_chapter_category_approved_unique`
- **Lead Mediation**: All leads are `pending` until a chapter admin approves/rejects
- **Appointment Booking**: Uses atomic select-and-update pattern to prevent double booking
- **Hero Slides**: Controlled exclusively by super_admin, only active slides shown publicly
