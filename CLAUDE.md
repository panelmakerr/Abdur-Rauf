# Hospital Careers Platform

A Next.js + Supabase + Resend platform for hospital HR recruitment.

## Architecture

```
┌──────────────────────────────────────────────────┐
│                    Frontend (Next.js)            │
│  /         - Public job board                     │
│  /apply/[id]  - Multi-step application form       │
│  /applicant   - Candidate application dashboard   │
│  /admin       - Admin console (jobs + ATS)        │
│  /login       - Staff authentication              │
│  /signup      - Staff account creation            │
├──────────────────────────────────────────────────┤
│              API Layer (Server Actions)          │
│  actions.ts   - All server-side operations        │
│  email.ts     - Resend transactional emails       │
├──────────────────────────────────────────────────┤
│              Backend (Supabase)                   │
│  PostgreSQL   - profiles, jobs, applications       │
│  Storage      - Private resumes bucket (5MB)      │
│  RLS          - Row-level security policies       │
└──────────────────────────────────────────────────┘
```

## Features

- **Public Job Board** — List active hospital vacancies
- **Multi-step Application Form** — Secure PDF resume upload (5MB limit)
- **Admin Console** — Job management + Applicant Tracking System (ATS)
- **Kanban Board** — Visual pipeline for candidate status management
- **Applicant Dashboard** — Track application status in real-time
- **Email Automation** — Application receipts + status updates via Resend
- **Role-based Security** — Admin-only areas, private resume storage

## Getting Started

```bash
npm install
npm run dev
```

See `SETUP.md` for full configuration instructions.
