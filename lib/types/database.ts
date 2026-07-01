// Database enumerated types
export type UserRole = 'super_admin' | 'chapter_admin' | 'member'
export type ProfileStatus = 'pending' | 'approved' | 'rejected'
export type InquiryStatus = 'pending' | 'approved' | 'rejected'

// ─── Core Entities ───────────────────────────────────────────────────────────

export interface Area {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface Chapter {
  id: string
  name: string
  slug: string
  area_id: string
  area?: Area
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  is_featured: boolean
  meta_description: string | null
  alt_text: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  status: ProfileStatus
  business_name: string | null
  brand_tagline: string | null
  bio: string | null
  phone: string | null
  website_url: string | null
  linkedin_url: string | null
  business_address: string | null
  logo_url: string | null
  ideal_referral_target: string | null
  referral_triggers: string | null
  chapter_id: string | null
  category_id: string | null
  membership_fee_paid: boolean
  appointment_timestamp: string | null
  assigned_admin_id: string | null
  created_at: string
  updated_at: string
  // Joined relations — use structural subset types to accommodate partial Supabase selects
  chapter?: { id?: string; name: string; slug?: string; area_id?: string; area?: { id?: string; name: string; slug?: string } | null; created_at?: string; updated_at?: string } | null
  category?: { id?: string; name: string; slug?: string } | null
  assigned_admin?: Profile
}

export interface MemberInquiry {
  id: string
  target_member_id: string
  chapter_id: string
  visitor_name: string
  visitor_email: string
  visitor_phone: string | null
  message: string
  status: InquiryStatus
  created_at: string
  updated_at: string
  reviewed_by: string | null
  reviewed_at: string | null
  // Joined relations
  target_member?: Profile
  chapter?: Chapter
  reviewer?: Profile
}

export interface ContactInquiry {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  created_at: string
}

export interface GalleryPost {
  id: string
  title: string
  content: string | null
  area_id: string | null
  chapter_id: string | null
  created_by: string
  created_at: string
  updated_at: string
  images?: GalleryImage[]
  creator?: Profile
  area?: Area
  chapter?: Chapter
}

export interface GalleryImage {
  id: string
  post_id: string
  image_url: string
  alt_text: string
  display_order: number
  created_at: string
}

export interface AdminAvailability {
  id: string
  admin_id: string
  blocked_date: string
  start_time: string | null
  end_time: string | null
  reason: string | null
  created_at: string
}

export interface AppointmentSlot {
  id: string
  admin_id: string
  slot_datetime: string
  is_occupied: boolean
  booked_by_profile_id: string | null
  created_at: string
  admin?: Profile
}

// ─── Hero Carousel Slides (Superadmin-controlled) ────────────────────────────

export interface HeroSlide {
  id: string
  title: string | null
  subtitle: string | null
  image_url: string
  alt_text: string
  cta_text: string | null
  cta_url: string | null
  display_order: number
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

// ─── Form DTOs ────────────────────────────────────────────────────────────────

export interface OnboardingFormData {
  company_full_name: string
  brand_tagline: string
  bio: string
  phone: string
  website_url?: string
  linkedin_url?: string
  business_address: string
  ideal_referral_target?: string
  referral_triggers?: string
  logo_file: File | null
  chapter_id: string
  category_id: string
  appointment_slot_id: string
}

export interface ContactFormData {
  name: string
  email: string
  subject?: string
  message: string
}

export interface LeadInquiryFormData {
  visitor_name: string
  visitor_email: string
  visitor_phone?: string
  message: string
  target_member_id: string
}

export interface AdminApprovalData {
  profile_id: string
  status: 'approved' | 'rejected'
  membership_fee_paid?: boolean
}

// ─── Server Action Response ───────────────────────────────────────────────────

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}
