"use client";

import { signOut } from "@/app/actions";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
    >
      Sign out
    </button>
  );
}