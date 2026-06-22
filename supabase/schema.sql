-- =========================================================
-- People's Choice Learning Portal — Supabase Schema
-- PCTIH (People's Choice Technology & Innovation Hub)
-- =========================================================
create extension if not exists "uuid-ossp";

-- ---------- ENUMS ----------
create type user_role as enum ('super_admin','admin','finance_officer','trainer','front_desk','student');
create type item_status as enum ('draft','published','unpublished');
create type event_status as enum ('upcoming','active','completed','cancelled');
create type payment_status as enum ('pending','approved','rejected','refunded');
create type enrollment_status as enum ('pending_payment','active','completed','cancelled');
create type attendance_status as enum ('present','absent','late');
create type lead_status as enum ('new','contacted','interested','converted','not_interested');
create type lead_source as enum ('facebook','whatsapp','referral','flyer','walk_in','event','website','other');
create type discount_type as enum ('percentage','fixed');
create type discount_scope as enum ('course','workshop','all');
create type registerable_type as enum ('course','workshop');

-- ---------- PROFILES ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  gender text,
  date_of_birth date,
  role user_role not null default 'student',
  referral_code text unique,
  referred_by uuid references profiles(id),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_profiles_role on profiles(role);

-- ---------- TRAINERS ----------
create table trainers (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete set null,
  display_name text not null,
  bio text,
  specialty text,
  photo_url text,
  created_at timestamptz not null default now()
);

-- ---------- COURSES ----------
create table courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  is_free boolean not null default true,
  price numeric(10,2) not null default 0,
  duration text,
  trainer_id uuid references trainers(id),
  schedule text,
  venue text,
  capacity int default 30,
  image_url text,
  status item_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_courses_status on courses(status);

-- ---------- WORKSHOPS / EVENTS ----------
create table workshops (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  type text not null default 'workshop', -- workshop, seminar, bootcamp, short_training, event
  description text,
  date date not null,
  time text,
  venue text,
  is_free boolean not null default true,
  price numeric(10,2) not null default 0,
  capacity int default 50,
  image_url text,
  facilitator_id uuid references trainers(id),
  registration_deadline date,
  status event_status not null default 'upcoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_workshops_status on workshops(status);
create index idx_workshops_date on workshops(date);

-- ---------- PROMO CODES ----------
create table promo_codes (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  discount_type discount_type not null,
  discount_value numeric(10,2) not null,
  scope discount_scope not null default 'all',
  course_id uuid references courses(id),
  workshop_id uuid references workshops(id),
  expiry_date date,
  usage_limit int,
  used_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- ENROLLMENTS ----------
create table enrollments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references profiles(id) on delete cascade,
  registerable_type registerable_type not null,
  course_id uuid references courses(id),
  workshop_id uuid references workshops(id),
  status enrollment_status not null default 'pending_payment',
  promo_code_id uuid references promo_codes(id),
  referral_id uuid,
  enrolled_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_one_target check (
    (registerable_type = 'course' and course_id is not null and workshop_id is null) or
    (registerable_type = 'workshop' and workshop_id is not null and course_id is null)
  )
);
create index idx_enrollments_student on enrollments(student_id);
create index idx_enrollments_status on enrollments(status);

-- ---------- PAYMENTS ----------
create table payments (
  id uuid primary key default uuid_generate_v4(),
  enrollment_id uuid references enrollments(id) on delete cascade,
  amount numeric(10,2) not null,
  payer_phone text not null,
  transaction_id text not null,
  payment_date date not null,
  proof_url text,
  status payment_status not null default 'pending',
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
);
create index idx_payments_status on payments(status);

-- ---------- RECEIPTS ----------
create table receipts (
  id uuid primary key default uuid_generate_v4(),
  payment_id uuid references payments(id) on delete cascade,
  receipt_number text unique not null,
  issued_at timestamptz not null default now(),
  pdf_url text
);

-- ---------- ATTENDANCE ----------
create table attendance (
  id uuid primary key default uuid_generate_v4(),
  enrollment_id uuid references enrollments(id) on delete cascade,
  session_date date not null,
  status attendance_status not null default 'present',
  marked_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  unique(enrollment_id, session_date)
);

-- ---------- LEARNING MATERIALS ----------
create table learning_materials (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  file_url text,
  notes text,
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ---------- CERTIFICATES ----------
create table certificates (
  id uuid primary key default uuid_generate_v4(),
  certificate_id text unique not null,
  student_id uuid references profiles(id),
  enrollment_id uuid references enrollments(id),
  title text not null,
  completion_date date not null,
  issued_at timestamptz not null default now(),
  issued_by uuid references profiles(id)
);

create table certificate_verifications (
  id uuid primary key default uuid_generate_v4(),
  certificate_id text not null,
  verified_at timestamptz not null default now(),
  ip_address text
);

-- ---------- NOTIFICATIONS ----------
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_profile on notifications(profile_id);

-- ---------- LEADS ----------
create table leads (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text,
  email text,
  interest text,
  source lead_source not null default 'website',
  status lead_status not null default 'new',
  follow_up_date date,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- REFERRALS ----------
create table referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_id uuid references profiles(id) on delete cascade,
  referred_id uuid references profiles(id) on delete cascade,
  reward_note text,
  created_at timestamptz not null default now(),
  unique(referrer_id, referred_id)
);

-- ---------- SETTINGS ----------
create table settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table profiles enable row level security;
alter table trainers enable row level security;
alter table courses enable row level security;
alter table workshops enable row level security;
alter table promo_codes enable row level security;
alter table enrollments enable row level security;
alter table payments enable row level security;
alter table receipts enable row level security;
alter table attendance enable row level security;
alter table learning_materials enable row level security;
alter table certificates enable row level security;
alter table certificate_verifications enable row level security;
alter table notifications enable row level security;
alter table leads enable row level security;
alter table referrals enable row level security;
alter table settings enable row level security;

-- helper: is staff (admin-tier) role
create or replace function is_staff(uid uuid) returns boolean as $$
  select exists (
    select 1 from profiles
    where id = uid and role in ('super_admin','admin','finance_officer','front_desk')
  );
$$ language sql security definer stable;

create or replace function is_trainer(uid uuid) returns boolean as $$
  select exists (select 1 from profiles where id = uid and role = 'trainer');
$$ language sql security definer stable;

-- PROFILES
create policy "profiles self read" on profiles for select using (auth.uid() = id or is_staff(auth.uid()) or is_trainer(auth.uid()));
create policy "profiles self update" on profiles for update using (auth.uid() = id or is_staff(auth.uid()));
create policy "profiles insert self" on profiles for insert with check (auth.uid() = id);
create policy "profiles staff delete" on profiles for delete using (is_staff(auth.uid()));

-- PUBLIC READ: courses/workshops published
create policy "courses public read" on courses for select using (status = 'published' or is_staff(auth.uid()) or is_trainer(auth.uid()));
create policy "courses staff write" on courses for insert with check (is_staff(auth.uid()));
create policy "courses staff update" on courses for update using (is_staff(auth.uid()));
create policy "courses staff delete" on courses for delete using (is_staff(auth.uid()));

create policy "workshops public read" on workshops for select using (status <> 'draft' or is_staff(auth.uid()));
create policy "workshops staff write" on workshops for insert with check (is_staff(auth.uid()));
create policy "workshops staff update" on workshops for update using (is_staff(auth.uid()));
create policy "workshops staff delete" on workshops for delete using (is_staff(auth.uid()));

create policy "trainers public read" on trainers for select using (true);
create policy "trainers staff write" on trainers for all using (is_staff(auth.uid()));

create policy "promo public read active" on promo_codes for select using (is_active or is_staff(auth.uid()));
create policy "promo staff write" on promo_codes for all using (is_staff(auth.uid()));

-- ENROLLMENTS: student sees own, staff/trainer sees all
create policy "enrollments student read" on enrollments for select using (student_id = auth.uid() or is_staff(auth.uid()) or is_trainer(auth.uid()));
create policy "enrollments student insert" on enrollments for insert with check (student_id = auth.uid() or is_staff(auth.uid()));
create policy "enrollments staff update" on enrollments for update using (is_staff(auth.uid()) or is_trainer(auth.uid()) or student_id = auth.uid());

-- PAYMENTS: student sees own (via enrollment), staff/finance sees all
create policy "payments read" on payments for select using (
  is_staff(auth.uid()) or exists (select 1 from enrollments e where e.id = enrollment_id and e.student_id = auth.uid())
);
create policy "payments insert" on payments for insert with check (
  exists (select 1 from enrollments e where e.id = enrollment_id and e.student_id = auth.uid()) or is_staff(auth.uid())
);
create policy "payments staff update" on payments for update using (is_staff(auth.uid()));

create policy "receipts read" on receipts for select using (
  is_staff(auth.uid()) or exists (
    select 1 from payments p join enrollments e on e.id = p.enrollment_id
    where p.id = payment_id and e.student_id = auth.uid()
  )
);
create policy "receipts staff write" on receipts for all using (is_staff(auth.uid()));

create policy "attendance read" on attendance for select using (
  is_staff(auth.uid()) or is_trainer(auth.uid()) or exists (select 1 from enrollments e where e.id = enrollment_id and e.student_id = auth.uid())
);
create policy "attendance trainer write" on attendance for all using (is_staff(auth.uid()) or is_trainer(auth.uid()));

create policy "materials read" on learning_materials for select using (
  is_staff(auth.uid()) or is_trainer(auth.uid()) or exists (
    select 1 from enrollments e where e.course_id = learning_materials.course_id and e.student_id = auth.uid()
  )
);
create policy "materials trainer write" on learning_materials for all using (is_staff(auth.uid()) or is_trainer(auth.uid()));

create policy "certificates read" on certificates for select using (is_staff(auth.uid()) or student_id = auth.uid() or is_trainer(auth.uid()));
create policy "certificates staff write" on certificates for all using (is_staff(auth.uid()));

create policy "cert verifications public insert" on certificate_verifications for insert with check (true);
create policy "cert verifications staff read" on certificate_verifications for select using (is_staff(auth.uid()));

create policy "notifications self read" on notifications for select using (profile_id = auth.uid() or is_staff(auth.uid()));
create policy "notifications self update" on notifications for update using (profile_id = auth.uid());
create policy "notifications staff insert" on notifications for insert with check (true);

create policy "leads staff all" on leads for all using (is_staff(auth.uid()));

create policy "referrals self read" on referrals for select using (referrer_id = auth.uid() or is_staff(auth.uid()));
create policy "referrals insert" on referrals for insert with check (true);

create policy "settings staff all" on settings for all using (is_staff(auth.uid()));
create policy "settings public read" on settings for select using (true);

-- =========================================================
-- TRIGGERS
-- =========================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated before update on profiles for each row execute function set_updated_at();
create trigger trg_courses_updated before update on courses for each row execute function set_updated_at();
create trigger trg_workshops_updated before update on workshops for each row execute function set_updated_at();
create trigger trg_enrollments_updated before update on enrollments for each row execute function set_updated_at();
create trigger trg_leads_updated before update on leads for each row execute function set_updated_at();

-- auto-create profile + referral code on signup
create or replace function handle_new_user() returns trigger as $$
declare
  gen_code text;
begin
  gen_code := upper(substr(replace(uuid_generate_v4()::text,'-',''),1,8));
  insert into profiles (id, full_name, email, role, referral_code)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.email, 'student', gen_code);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
