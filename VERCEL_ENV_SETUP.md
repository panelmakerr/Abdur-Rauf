# Environment Variables for Vercel

## Add these in Vercel Dashboard → Settings → Environment Variables

### Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://zkuvzibggcaphaqygtsl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_HL3q_HWxJjz0B1otCmReCg_LZzIFHN_

### Resend Email Configuration
RESEND_API_KEY=your_resend_api_key_here

### Database URL (Optional - for migrations)
DATABASE_URL=postgresql://postgres:Raymora.vercel.app@db.zkuvzibggcaphaqygtsl.supabase.co:5432/postgres

---

## Steps to Add in Vercel:

1. Go to: https://vercel.com/dashboard
2. Select your project: Abdur-Rauf
3. Click "Settings" tab
4. Click "Environment Variables" in left sidebar
5. Add each variable above:
   - Key: NEXT_PUBLIC_SUPABASE_URL
   - Value: https://zkuvzibggcaphaqygtsl.supabase.co
   - Environment: Production, Preview, Development (check all)
   - Click "Save"
6. Repeat for all variables
7. Go to "Deployments" tab
8. Click "..." on latest deployment → "Redeploy"

## IMPORTANT: Update Resend API Key
You need to add your actual Resend API key - get it from:
https://resend.com/api-keys
