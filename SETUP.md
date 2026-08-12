# Hospital Careers Platform — Setup

Next.js + Supabase (Auth, Postgres, Storage) + Resend (email).

## 1. Clone & Install

```bash
git clone https://github.com/panelmakerr/Abdur-Rauf.git
cd Abdur-Rauf
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## 2. Environment

Create `.env.local` (see `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
RESEND_API_KEY=re_xxx              # optional, for emails
EMAIL_FROM=recruitment@yourdomain.com   # optional
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 3. Database Setup

Run `supabase/schema.sql` in your Supabase SQL Editor.

This creates with Row-Level Security (RLS):
- `profiles` — staff accounts (role: admin only)
- `jobs` — job vacancies (active/draft/archived)
- `applications` — candidate applications
- `resumes` — private storage bucket (5MB limit)

## 4. Creating the First Admin

Due to security design, new signups are always `applicant` role. Promote to admin:

1. Sign up at `http://localhost:3000/signup`
2. Run in Supabase SQL Editor:
   ```sql
   select public.set_admin('your-email@example.com');
   ```
3. Access admin console at `http://localhost:3000/admin`

## 5. Email Setup (Resend — recommended)

Get a key from [resend.com](https://resend.com) and add to `.env.local`:
```env
RESEND_API_KEY=re_xxx
EMAIL_FROM=recruitment@yourdomain.com
```

Verify your domain in Resend (add DKIM/SPF DNS records).

For Supabase auth emails, configure Custom SMTP in Supabase Dashboard → Settings → Authentication → SMTP provider with `smtp.resend.com`.

Without a key, emails are logged but not sent — app still works.

## 6. Storage Policies

The `resumes` bucket is private by default:
- Anyone can **upload** resumes (applicants)
- Only **admins** can **read/download** resumes (protected by RLS)

## 7. Deploy (Vercel)

```bash
git add .
git commit -m "deploy"
git push origin main
```

Set environment variables in Vercel dashboard.

## Trade-offs

- Signups default to `applicant` role; admin promotion requires SQL function
- Resume downloads use anonymous key + RLS (no server-side service_role key)
- Kanban board uses HTML drag-and-drop API (no external dependencies)
- Email templates use inline HTML with React Email-style structure
