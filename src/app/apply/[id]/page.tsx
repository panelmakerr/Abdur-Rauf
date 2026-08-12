import { createServerSupabase } from "@/lib/server";
import ApplyForm from "./ApplyForm";

export const dynamic = "force-dynamic";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (!job) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Job not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          This position may have been closed or archived.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-bold">{job.title}</h1>
      <p className="mt-1 text-sm text-teal-700">{job.department}</p>
      <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{job.description}</p>
      <div className="mt-8">
        <ApplyForm jobId={job.id} jobTitle={job.title} />
      </div>
    </div>
  );
}