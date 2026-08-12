import Link from "next/link";
import { createServerSupabase } from "@/lib/server";

export const dynamic = "force-dynamic";

export default async function JobBoard() {
  const supabase = await createServerSupabase();
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-sm">Could not load jobs ({error.message}).</p>
        <p className="mt-2 text-xs text-slate-500">
          Make sure the Supabase tables are created — see <code>supabase/schema.sql</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Open positions</h1>
      <p className="mt-1 text-sm text-slate-500">
        Apply to join our team — upload your CV and our HR team will get in touch.
      </p>

      {jobs.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No open positions right now. Please check back later.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{job.title}</h2>
                  <p className="mt-0.5 text-sm text-teal-700">{job.department}</p>
                </div>
                <Link
                  href={`/apply/${job.id}`}
                  className="shrink-0 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                >
                  Apply
                </Link>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-slate-600">
                {job.description}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}