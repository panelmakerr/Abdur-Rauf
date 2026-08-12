import { createServerSupabase } from "@/lib/server";
import type { Application, Job } from "@/lib/types";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createServerSupabase();

  const [jobsRes, appsRes] = await Promise.all([
    supabase.from("jobs").select("*").order("created_at", { ascending: false }),
    supabase.from("applications").select("*").order("applied_at", { ascending: false }).limit(200),
  ]);

  const jobs: Job[] = jobsRes.data ?? [];
  const applications: (Application & { job_title?: string })[] =
    (appsRes.data ?? []).map((app) => ({
      ...app,
      job_title: jobs.find((j) => j.id === app.job_id)?.title ?? "Deleted job",
    }));

  return (
    <AdminDashboard
      jobs={jobs}
      applications={applications}
      jobsResError={jobsRes.error?.message ?? null}
      appsResError={appsRes.error?.message ?? null}
    />
  );
}