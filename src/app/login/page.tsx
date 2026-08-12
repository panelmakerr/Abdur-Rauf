"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/app/actions";

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none";
const labelCls = "block text-sm font-medium text-slate-700";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-xl font-bold">Sign in</h1>
      <p className="mt-1 text-sm text-slate-500">Staff / admin portal.</p>

      <form
        className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          const res = await signIn(email, password);
          if (!res.ok) {
            setError(res.error ?? "Sign-in failed");
            setBusy(false);
          }
        }}
      >
        <div>
          <label className={labelCls}>Email</label>
          <input
            type="email"
            className={inputCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelCls}>Password</label>
          <input
            type="password"
            className={inputCls}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-xs text-slate-500">
          New staff member?{" "}
          <Link href="/signup" className="text-teal-700 hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}