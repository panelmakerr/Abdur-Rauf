# Hospital Recruitment Platform

A modern hospital recruitment and applicant tracking system built with Next.js, Supabase, and Resend.

## Features

- 📋 **Public Job Board** - Display active hospital job vacancies
- 📝 **Application System** - Easy application form with PDF resume upload
- 🔐 **Admin Dashboard** - Secure admin panel with role-based access
- 📊 **Applicant Tracking** - Manage applications with status pipeline (Received, Reviewing, Shortlisted, Rejected)
- 📧 **Automated Emails** - Notification system for application confirmations and status updates
- 🔒 **Row Level Security** - Secure data access with Supabase RLS policies
- 📁 **Secure Storage** - Private resume storage with access control

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Email**: Resend API
- **Deployment**: Vercel-ready

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
DATABASE_URL=your_database_url
```

### 3. Set Up Supabase Database

Run the `supabase-schema.sql` file in your Supabase SQL Editor to create:
- Tables: profiles, jobs, applications
- Row Level Security policies
- Storage bucket for resumes

### 4. Configure Resend

1. Sign up at [Resend.com](https://resend.com)
2. Verify your domain
3. Add API key to `.env.local`
4. Update sender email in `app/api/send-email/route.ts`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

**For Applicants**: Browse jobs and submit applications with resume upload

**For Admins**: Login at `/admin/login` to manage applications and update statuses

## Project Structure

```
├── app/
│   ├── page.tsx                 # Public job board
│   ├── apply/[id]/page.tsx      # Application form
│   ├── admin/
│   │   ├── login/page.tsx       # Admin login
│   │   └── dashboard/page.tsx   # Admin dashboard
│   └── api/send-email/route.ts  # Email API
├── lib/supabase.ts              # Supabase client
└── supabase-schema.sql          # Database schema
```

## License

MIT
