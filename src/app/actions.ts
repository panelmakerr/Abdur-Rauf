"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/server";
import { sendApplicationReceived, sendStatusUpdate } from "@/lib/email";

type ActionResult = { ok: boolean; error?: string };

async function requireAdmin() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") throw new Error("Admin only");
  return supabase;
}

// ---------------------------------------------------------------
// Public: submit an application (resume already uploaded client-side)
// ---------------------------------------------------------------
export async function applyToJob(input: {
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  coverNote: string;
  resumePath: string;
}): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from("applications").insert({
      job_id: input.jobId,
      applicant_name: input.name,
      applicant_email: input.email,
      applicant_phone: input.phone,
      cover_note: input.coverNote,
      resume_storage_path: input.resumePath,
      status: "received",
    });
    if (error) return { ok: false, error: error.message };

    await sendApplicationReceived({
      to: input.email,
      name: input.name,
      jobTitle: input.jobTitle,
    });

    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// ---------------------------------------------------------------
// Admin: job management
// ---------------------------------------------------------------
export async function createJob(input: {
  title: string;
  department: string;
  description: string;
  status: "active" | "draft" | "archived";
}): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("jobs").insert({
      title: input.title,
      department: input.department,
      description: input.description,
      status: input.status,
      created_by: user!.id,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function updateJob(
  id: string,
  input: { status: "active" | "draft" | "archived" }
): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("jobs").update(input).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteJob(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// ---------------------------------------------------------------
// Admin: application status change + notification email
// ---------------------------------------------------------------
export async function updateApplicationStatus(
  applicationId: string,
  status: "received" | "reviewing" | "shortlisted" | "rejected"
): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { data: app, error: getErr } = await supabase
      .from("applications")
      .select("id, job_id, applicant_name, applicant_email")
      .eq("id", applicationId)
      .single();
    if (getErr || !app) return { ok: false, error: getErr?.message ?? "Not found" };

    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", applicationId);
    if (error) return { ok: false, error: error.message };

    const { data: job } = await supabase
      .from("jobs")
      .select("title")
      .eq("id", app.job_id)
      .single();

    const jobTitle = job?.title ?? "your application";
    await sendStatusUpdate({
      to: app.applicant_email,
      name: app.applicant_name,
      jobTitle,
      status,
    });

    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
// ---------------------------------------------------------------
// Auth
// ---------------------------------------------------------------
export async function signIn(email: string, password: string): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    redirect("/admin");
  } catch (e) {
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function signUp(input: {
  email: string;
  password: string;
  fullName: string;
  role?: "admin" | "applicant";
}): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
    });
    if (error) return { ok: false, error: error.message };
    if (!data.user) return { ok: false, error: "Signup did not return a user." };

    const session = data.session;
    if (session) {
      // New signups are always applicants. Promote via admin SQL:
      // select public.set_admin('email@example.com');
      const { error: profileErr } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: input.fullName,
        role: "applicant",
      });
      if (profileErr) return { ok: false, error: profileErr.message };
      redirect("/admin");
    }
    return {
      ok: true,
      error: "Account created — check your email to confirm, then sign in.",
    };
  } catch (e) {
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}
