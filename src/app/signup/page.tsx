"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/app/actions";

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none";
const labelCls = "block text-sm font-medium text-slate-700";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-xl font-bold">Create staff account</h1>
      <p className="mt-1 text-sm text-slate-500">
        This is the internal admin portal — accounts are for hospital staff only.
      </p>

      <form
        className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setMessage(null);
          const res = await signUp({ email, password, fullName, role: "applicant" });
          if (!res.ok || res.error) {
            setMessage({ ok: false, text: res.error ?? "Sign-up failed" });
          } else {
            setMessage({ ok: true, text: res.error ?? "Account created." });
          }
          setBusy(false);
        }}
      >
        <div>
          <label className={labelCls}>Full name</label>
          <input className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Password</label>
          <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </div>
        {message && (
          <p className={`text-xs ${message.ok ? "text-teal-700" : "text-red-600"}`}>{message.text}</p>
        )}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create account"}
        </button>
        <p className="text-xs text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="text-teal-700 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
