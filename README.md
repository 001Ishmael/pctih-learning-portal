# People's Choice Learning Portal

A web platform for **People's Choice Technology & Innovation Hub (PCTIH)** — Freetown, Sierra Leone.
Students register for courses, workshops, seminars and bootcamps (free or paid), pay via Orange Money
(manual confirmation), and track enrollment, payments, receipts and certificates. Admins, finance
officers and trainers manage everything from role-based dashboards.

- Website: www.peopleschoicehub.com
- Email: peopleschoicet@gmail.com
- Phone: +232 79 468 780
- Address: 4 Andrew Street, Off Krootown Road, Freetown, Sierra Leone

## Tech Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4
- Supabase (Postgres, Auth, Storage, Row Level Security)
- React Router v6
- Deploy target: Vercel

## User Roles

| Role | Access |
|---|---|
| `super_admin` / `admin` | Full dashboard — courses, workshops, payments, enrollments, trainers, certificates, leads, promo codes |
| `finance_officer` | Finance overview + payment approvals/rejections |
| `front_desk` | Admin dashboard (leads, enrollments) |
| `trainer` | Assigned courses, students, attendance, learning materials |
| `student` | Public site + student dashboard (enroll, pay, receipts, certificates, notifications) |

## Project Structure

```
src/
  components/        Shared layout & UI (PublicLayout, DashboardLayout, ProtectedRoute, ui/*)
  lib/                Supabase client, AuthContext, types, formatting helpers
  pages/
    public/           Home, About, Courses, CourseDetails, Workshops, EventDetails,
                       Register, Login, Contact, FAQ, VerifyCertificate
    student/          Student dashboard, enroll/payment flow, enrollments, schedule,
                       certificates, notifications
    admin/            Courses, Workshops, Payments, Enrollments, Trainers, Certificates,
                       Leads, Promo Codes, Finance reports
    trainer/          Courses, Students, Attendance, Materials
supabase/
  schema.sql          Full database schema + RLS policies + triggers
  seed.sql            Sample courses, workshops and settings
  storage.sql         Storage bucket + policies for payment proof uploads
```

## 1. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run **`supabase/schema.sql`**, then **`supabase/storage.sql`**, then
   (optionally) **`supabase/seed.sql`** for sample courses/workshops.
3. Under **Project Settings > API**, copy the **Project URL** and **anon public key**.

### Creating your first admin

New sign-ups default to the `student` role. To promote an account to admin, run in the SQL editor:

```sql
update profiles set role = 'super_admin' where email = 'you@example.com';
```

Use the same pattern for `finance_officer`, `trainer`, or `front_desk`.

## 2. Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ORANGE_MONEY_NUMBER=+232 79 468 780
```

## 3. Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## 4. Payment Flow (Manual Orange Money)

1. Student enrolls in a paid course/workshop.
2. App shows Orange Money payment instructions (number from `VITE_ORANGE_MONEY_NUMBER`).
3. Student submits payer phone, transaction ID, amount, date, and proof screenshot.
4. Payment row is created with `status = pending`.
5. Admin/Finance Officer reviews under **Admin > Payments**, approves or rejects.
6. On approval: enrollment becomes `active`, a receipt is generated, and the student is notified.
7. Student downloads the receipt from **My Enrollments**.

## 5. Certificates

Admins issue certificates from **Admin > Certificates** for enrollments marked `completed`
(trainers can mark students completed from **Trainer > Students**). Each certificate gets a unique
ID (e.g. `PCTIH-2026-AB12CD`). Anyone can confirm authenticity at **/verify-certificate**.

## 6. Adding the PCTIH Logo

- Replace `public/favicon.svg` with the official PCTIH logo for the browser tab icon.
- The header logo placeholder is in [`src/components/PublicLayout.tsx`](src/components/PublicLayout.tsx)
  and [`src/components/DashboardLayout.tsx`](src/components/DashboardLayout.tsx) — swap the
  `<div className="... bg-brand-600 ...">PC</div>` block for an `<img>` tag once you have the logo file.
- Course/workshop images are set per-item in the admin forms (`image_url` field).

## 7. Deploying to Vercel

```bash
npm install -g vercel   # if not already installed
vercel
```

1. Import the project in the [Vercel dashboard](https://vercel.com/new) or run `vercel` from this folder.
2. Framework preset: **Vite**.
3. Add the environment variables from `.env.example` under **Project Settings > Environment Variables**.
4. Deploy. `vercel.json` is already configured to rewrite all routes to `index.html` for client-side routing.

## 8. Notifications

In-app notifications (registration received, payment pending/approved/rejected, certificate issued)
are written to the `notifications` table and shown in the student dashboard. Email delivery is not
yet wired up — to add it, call a Supabase Edge Function or a service like Resend/SendGrid whenever a
row is inserted into `notifications` (e.g. via a Postgres trigger + `pg_net`, or from the client after
each insert).

## 9. Security Notes

- All tables have Row Level Security enabled (see `supabase/schema.sql`).
- Students can only read/write their own enrollments, payments, and notifications.
- Only `super_admin`, `admin`, `finance_officer`, and `front_desk` roles can manage courses, workshops,
  payments, leads, and promo codes (enforced both in RLS and in the UI's `ProtectedRoute`).
- Payment proof files are stored in a private `payment-proofs` bucket; only the uploading student and
  staff can read them (signed URLs are generated on demand in **Admin > Payments**).
