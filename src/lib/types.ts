export type UserRole = 'super_admin' | 'admin' | 'finance_officer' | 'trainer' | 'front_desk' | 'student';
export type ItemStatus = 'draft' | 'published' | 'unpublished';
export type EventStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded';
export type EnrollmentStatus = 'pending_payment' | 'active' | 'completed' | 'cancelled';
export type AttendanceStatus = 'present' | 'absent' | 'late';
export type LeadStatus = 'new' | 'contacted' | 'interested' | 'converted' | 'not_interested';
export type LeadSource = 'facebook' | 'whatsapp' | 'referral' | 'flyer' | 'walk_in' | 'event' | 'website' | 'other';
export type DiscountType = 'percentage' | 'fixed';
export type DiscountScope = 'course' | 'workshop' | 'all';
export type RegisterableType = 'course' | 'workshop';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  role: UserRole;
  referral_code?: string | null;
  referred_by?: string | null;
  avatar_url?: string | null;
  created_at: string;
}

export interface Trainer {
  id: string;
  profile_id?: string | null;
  display_name: string;
  bio?: string | null;
  specialty?: string | null;
  photo_url?: string | null;
  profiles?: Profile;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  is_free: boolean;
  price: number;
  duration?: string | null;
  trainer_id?: string | null;
  schedule?: string | null;
  venue?: string | null;
  capacity?: number | null;
  image_url?: string | null;
  status: ItemStatus;
  created_at: string;
  trainers?: Trainer;
}

export interface Workshop {
  id: string;
  title: string;
  slug: string;
  type: string;
  description?: string | null;
  date: string;
  time?: string | null;
  venue?: string | null;
  is_free: boolean;
  price: number;
  capacity?: number | null;
  image_url?: string | null;
  facilitator_id?: string | null;
  registration_deadline?: string | null;
  status: EventStatus;
  created_at: string;
  trainers?: Trainer;
}

export interface Enrollment {
  id: string;
  student_id: string;
  registerable_type: RegisterableType;
  course_id?: string | null;
  workshop_id?: string | null;
  status: EnrollmentStatus;
  promo_code_id?: string | null;
  enrolled_at: string;
  courses?: Course;
  workshops?: Workshop;
  profiles?: Profile;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  enrollment_id: string;
  amount: number;
  payer_phone: string;
  transaction_id: string;
  payment_date: string;
  proof_url?: string | null;
  status: PaymentStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  enrollments?: Enrollment;
}

export interface Receipt {
  id: string;
  payment_id: string;
  receipt_number: string;
  issued_at: string;
}

export interface Attendance {
  id: string;
  enrollment_id: string;
  session_date: string;
  status: AttendanceStatus;
}

export interface LearningMaterial {
  id: string;
  course_id: string;
  title: string;
  file_url?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface Certificate {
  id: string;
  certificate_id: string;
  student_id: string;
  enrollment_id?: string | null;
  title: string;
  completion_date: string;
  issued_at: string;
  profiles?: Profile;
}

export interface NotificationRow {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  interest?: string | null;
  source: LeadSource;
  status: LeadStatus;
  follow_up_date?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  scope: DiscountScope;
  course_id?: string | null;
  workshop_id?: string | null;
  expiry_date?: string | null;
  usage_limit?: number | null;
  used_count: number;
  is_active: boolean;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  reward_note?: string | null;
  created_at: string;
  referred?: Profile;
}
