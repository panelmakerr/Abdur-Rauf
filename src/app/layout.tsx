import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hospital Careers",
  description: "Hospital recruitment platform — apply or manage candidates",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
            <Link href="/" className="font-semibold text-teal-700">
              🏥 Hospital Careers
            </Link>
            <nav className="ml-auto flex items-center gap-4 text-sm">
              <Link href="/" className="hover:text-teal-700">Jobs</Link>
              <Link href="/applicant" className="hover:text-teal-700">My Applications</Link>
              <Link href="/admin" className="hover:text-teal-700">Admin</Link>
              <Link href="/login" className="hover:text-teal-700">Sign in</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
          Hospital Careers Platform © {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}