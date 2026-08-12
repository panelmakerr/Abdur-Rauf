import { createServerSupabase } from "@/lib/server";
import type { Application, Job } from "@/lib/types";
import Link from "next/link";
import { APPLICATION_STATUS_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

const badge: Record<string, string> = {
  received: "bg-slate-100 text-slate-600",
  reviewing: "bg-amber-100 text-amber-700",
  shortlisted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default async function ApplicantPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-xl font-semibold">Sign in required</h1>
        <p className="mt-2 text-sm text-slate-500">
          You need to be signed in to view your applications.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const { data: applications, error } = await supabase
    .from("applications")
    .select("*")
    .eq("applicant_email", user.email)
    .order("applied_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-xl font-semibold">Error</h1>
        <p className="mt-2 text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  const apps: Application[] = applications ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">My Applications</h1>
      <p className="mt-1 text-sm text-slate-500">
        Signed in as {user.email}
      </p>

      {apps.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <p className="text-sm text-slate-500">
            You haven't applied to any positions yet.
          </p>
          <Link href="/" className="mt-2 inline-block text-sm text-teal-700 hover:underline">
            Browse open positions →
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {apps.map((app) => (
            <div
              key={app.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">{app.applicant_name}</h2>
                  <p className="text-sm text-slate-600">Applied for position</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Applied on {new Date(app.applied_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    badge[app.status] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {APPLICATION_STATUS_LABELS[app.status]}
                </span>
              </div>

              {app.cover_note && (
                <p className="mt-2 truncate text-xs text-slate-500">
                  "{app.cover_note}"
                </p>
              )}

              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                <span>📧 {app.applicant_email}</span>
                {app.applicant_phone && <span>📞 {app.applicant_phone}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
