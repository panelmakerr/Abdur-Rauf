"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { applyToJob } from "@/app/actions";

type Props = { jobId: string; jobTitle: string };
type Step = 1 | 2 | 3;

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none";
const labelCls = "block text-sm font-medium text-slate-700";
const errCls = "mt-1 text-xs text-red-600";

export default function ApplyForm({ jobId, jobTitle }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async () => {
    if (!name || !email || !file) {
      setMessage({ ok: false, text: "Please fill in your name, email and CV." });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
      const path = `resumes/${crypto.randomUUID()}.${ext}`;

      setUploading(true);
      const { error: upErr } = await supabase.storage
        .from("resumes")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      setUploading(false);
      if (upErr) {
        setMessage({ ok: false, text: "Could not upload CV: " + upErr.message });
        setBusy(false);
        return;
      }

      const res = await applyToJob({
        jobId,
        jobTitle,
        name,
        email,
        phone,
        coverNote,
        resumePath: path,
      });

      if (res.ok) {
        setStep(3);
      } else {
        setMessage({ ok: false, text: res.error ?? "Something went wrong." });
      }
    } catch (e) {
      setMessage({
        ok: false,
        text: e instanceof Error ? e.message : "Something went wrong.",
      });
    } finally {
      setBusy(false);
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* step indicator */}
      <ol className="mb-6 flex items-center gap-2 text-xs">
        {(["Details", "Resume", "Done"] as const).map((label, i) => {
          const reached = step >= i + 1;
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className={
                  "flex h-6 w-6 items-center justify-center rounded-full font-medium " +
                  (reached ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-500")
                }
              >
                {i + 1}
              </span>
              <span className={reached ? "text-slate-700" : "text-slate-400"}>{label}</span>
              {i < 2 && <span className="h-px w-6 bg-slate-300" />}
            </li>
          );
        })}
      </ol>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Full name *</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Email *</label>
            <input
              type="email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Short note (optional)</label>
            <textarea
              rows={3}
              className={inputCls}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
            />
          </div>
          <button
            onClick={() => setStep(2)}
            className="mt-2 rounded-lg bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Next: CV
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Upload resume / CV (PDF, up to 5 MB) *</label>
            <input
              type="file"
              accept=".pdf"
              className={inputCls}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && <p className="mt-1 text-xs text-slate-500">{file.name}</p>}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={submit}
              disabled={busy || uploading}
              className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {busy || uploading ? "Submitting…" : "Submit application"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="py-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">
            ✅
          </div>
          <h2 className="text-lg font-semibold">Application submitted!</h2>
          <p className="mt-1 text-sm text-slate-500">
            Thank you, {name || "applicant"}. Our HR team will review your application
            for <strong>{jobTitle}</strong> and reach out to you soon.
          </p>
        </div>
      )}

      {message && (
        <p className={`${message.ok ? "text-teal-700" : errCls} mt-4 text-sm`}>
          {message.text}
        </p>
      )}
    </div>
  );
}