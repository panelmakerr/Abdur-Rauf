"use client";

import { useState } from "react";
import type { Application, Job } from "@/lib/types";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUSES } from "@/lib/types";
import { createJob, deleteJob, updateApplicationStatus, updateJob } from "@/app/actions";
import { createClient } from "@/lib/supabase";

type Props = {
  jobs: Job[];
  applications: (Application & { job_title?: string })[];
  jobsResError: string | null;
  appsResError: string | null;
};

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none";
const labelCls = "block text-sm font-medium text-slate-700";
const badge: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  draft: "bg-amber-100 text-amber-700",
  archived: "bg-slate-200 text-slate-600",
  received: "bg-slate-100 text-slate-600",
  reviewing: "bg-amber-100 text-amber-700",
  shortlisted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminDashboard({ jobs, applications, jobsResError, appsResError }: Props) {
  const [tab, setTab] = useState<"jobs" | "apps" | "kanban">("jobs");
  const [msg, setMsg] = useState<string | null>(null);

  const flash = async (fn: () => Promise<{ ok: boolean; error?: string }>, okText: string) => {
    const res = await fn();
    setMsg(res.ok ? okText : (res.error ?? "Action failed"));
    setTimeout(() => setMsg(null), 4000);
  };

  return (
    <div>
      {jobsResError || appsResError ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Database not ready:{" "}
          {jobsResError ?? appsResError}. Please run <code>supabase/schema.sql</code> in the
          Supabase SQL Editor.
        </div>
      ) : null}

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setTab("jobs")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === "jobs" ? "bg-teal-600 text-white" : "bg-white text-slate-600 border border-slate-300"
          }`}
        >
          Jobs ({jobs.length})
        </button>
        <button
          onClick={() => setTab("apps")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === "apps" ? "bg-teal-600 text-white" : "bg-white text-slate-600 border border-slate-300"
          }`}
        >
          Applications Table ({applications.length})
        </button>
        <button
          onClick={() => setTab("kanban")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === "kanban" ? "bg-teal-600 text-white" : "bg-white text-slate-600 border border-slate-300"
          }`}
        >
          Kanban Board ({applications.length})
        </button>
      </div>

      {msg && <p className="mb-4 text-sm text-teal-700">{msg}</p>}

      {tab === "jobs" && <JobsPanel jobs={jobs} flash={flash} />}
      {tab === "apps" && <AppsPanel applications={applications} flash={flash} />}
      {tab === "kanban" && <KanbanBoard applications={applications} flash={flash} />}
    </div>
  );
}

// ---------------------------------------------------------------
function JobsPanel({
  jobs,
  flash,
}: {
  jobs: Job[];
  flash: (fn: () => Promise<{ ok: boolean; error?: string }>, okText: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "draft">("active");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title || !department || !description) return;
    setBusy(true);
    await flash(
      () => createJob({ title, department, description, status }),
      "Job created"
    );
    setBusy(false);
    setOpen(false);
    setTitle("");
    setDepartment("");
    setDescription("");
    setStatus("active");
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Job board management</h2>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          {open ? "Cancel" : "+ New job"}
        </button>
      </div>

      {open && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold">Create a vacancy</h3>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Title *</label>
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Account Officer" />
            </div>
            <div>
              <label className={labelCls}>Department *</label>
              <input className={inputCls} value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Administration" />
            </div>
            <div>
              <label className={labelCls}>Description *</label>
              <textarea rows={4} className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Role summary, requirements…" />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as "active" | "draft")}>
                <option value="active">Active (public)</option>
                <option value="draft">Draft (hidden)</option>
              </select>
            </div>
            <button
              onClick={submit}
              disabled={busy}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save job"}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {jobs.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No jobs yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium">{job.title}</td>
                  <td className="px-4 py-3 text-slate-600">{job.department}</td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      value={job.status}
                      onChange={(e) =>
                        flash(
                          () => updateJob(job.id, { status: e.target.value as Job["status"] }),
                          "Job updated"
                        )
                      }
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(job.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => flash(() => deleteJob(job.id), "Job deleted")}
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
function AppsPanel({
  applications,
  flash,
}: {
  applications: (Application & { job_title?: string })[];
  flash: (fn: () => Promise<{ ok: boolean; error?: string }>, okText: string) => void;
}) {
  const [filter, setFilter] = useState<string>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered =
    filter === "all" ? applications : applications.filter((a) => a.status === filter);

  const download = async (app: Application) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage.from("resumes").download(app.resume_storage_path);
      if (error || !data) {
        alert("Could not download CV: " + (error?.message ?? "no file"));
        return;
      }
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      const ext = app.resume_storage_path.split(".").pop() ?? "pdf";
      a.href = url;
      a.download = `${app.applicant_name.replace(/\s+/g, "_")}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Download failed: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Candidates (ATS)</h2>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="received">Received</option>
          <option value="reviewing">Reviewing</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No applications in this view.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Applied</th>
                <th className="px-4 py-3">CV</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id} className="border-b border-slate-100 align-top last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{app.applicant_name}</p>
                    {app.cover_note && (
                      <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-500" title={app.cover_note}>
                        "{app.cover_note}"
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{app.job_title}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <p>{app.applicant_email}</p>
                    {app.applicant_phone && <p className="text-xs text-slate-400">{app.applicant_phone}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(app.applied_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => download(app)}
                      className="rounded-md border border-teal-600 px-2.5 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50"
                    >
                      Download
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`mr-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge[app.status]}`}>
                      {APPLICATION_STATUS_LABELS[app.status]}
                    </span>
                    <select
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      value={app.status}
                      disabled={busyId === app.id}
                      onChange={async (e) => {
                        setBusyId(app.id);
                        const status = e.target.value as Application["status"];
                        await flash(
                          () => updateApplicationStatus(app.id, status),
                          "Status updated & applicant emailed"
                        );
                        setBusyId(null);
                        window.location.reload();
                      }}
                    >
                      <option value="received">Received</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
function KanbanBoard({
  applications,
  flash,
}: {
  applications: (Application & { job_title?: string })[];
  flash: (fn: () => Promise<{ ok: boolean; error?: string }>, okText: string) => void;
}) {
  const [selectedApp, setSelectedApp] = useState<(Application & { job_title?: string }) | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const columns = APPLICATION_STATUSES;

  const cardsByColumn = (status: string) =>
    applications.filter((a) => a.status === status);

  const moveCard = async (app: Application, status: string) => {
    setBusyId(app.id);
    await flash(
      () => updateApplicationStatus(app.id, status as Application["status"]),
      "Status updated & applicant emailed"
    );
    setBusyId(null);
    window.location.reload();
  };

  const openModal = (app: Application) => {
    setSelectedApp(app);
    setNewStatus(app.status);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Candidate Kanban Board</h2>
        <p className="text-sm text-slate-500">
          Drag cards between columns or click a card to update status
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div key={col} className="flex min-w-[240px] flex-col gap-3">
            <h3 className="text-center text-xs font-medium uppercase text-slate-500">
              {APPLICATION_STATUS_LABELS[col]}
            </h3>
            <div className="flex flex-col gap-3">
              {cardsByColumn(col).map((app) => (
                <div
                  key={app.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", app.id)}
                  onClick={() => openModal(app)}
                  className="relative cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="absolute top-1 right-2 text-xs text-slate-300">⋮⋮</div>
                  <p className="font-medium text-sm">{app.applicant_name}</p>
                  <p className="text-xs text-slate-600">{app.job_title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(app.applied_at).toLocaleDateString()}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      badge[app.status]
                    }`}
                  >
                    {APPLICATION_STATUS_LABELS[app.status]}
                  </span>
                </div>
              ))}

              {/* Drop targets for drag-and-drop */}
              {busyId !== col && (
                <div
                  className="min-h-[40px] rounded-lg border-2 border-dashed border-slate-200"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const appId = e.dataTransfer.getData("text/plain");
                    const app = applications.find((a) => a.id === appId);
                    if (app) moveCard(app, col);
                  }}
                />
              )}
              {cardsByColumn(col).length === 0 && (
                <p className="text-center text-xs text-slate-400">No applications</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {columns.length === 0 && (
        <p className="text-center text-sm text-slate-500">No applications yet.</p>
      )}

      {/* Status update modal */}
      {selectedApp && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="text-lg font-semibold">Update Application</h3>
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-medium">{selectedApp.applicant_name}</span>
              <br />
              <span className="text-xs">for {selectedApp.job_title}</span>
            </p>

            <div className="mt-4">
              <label className={labelCls}>Status</label>
              <select
                className={inputCls}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {columns.map((s) => (
                  <option key={s} value={s}>
                    {APPLICATION_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedApp(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await flash(
                    () => updateApplicationStatus(selectedApp.id, newStatus as Application["status"]),
                    "Status updated & applicant emailed"
                  );
                  setSelectedApp(null);
                  window.location.reload();
                }}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
