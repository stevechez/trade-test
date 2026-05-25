"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Enter a valid email address.");
      return;
    }

    setIsSending(true);

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) throw error;

      toast.success("Magic link sent", {
        description: "Check your email to access SiteVerdict.",
      });
    } catch (error: unknown) {
      console.error("Login error:", error);
      toast.error("Could not send magic link", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.2),transparent_32%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgba(15,23,42,0.1),#020617)]" />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-lg shadow-blue-500/10">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <span className="text-xl font-black tracking-tight">SiteVerdict</span>
        </Link>

        <Link
          href="/"
          className="text-sm font-bold text-slate-400 transition-colors hover:text-white"
        >
          Back to site
        </Link>
      </nav>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-16 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-blue-200">
            <Sparkles className="h-4 w-4" />
            Contractor command access
          </div>

          <h1 className="mt-8 max-w-3xl text-6xl font-black leading-[1.02] tracking-[-0.025em] text-white">
            Review the people behind the work.
          </h1>

          <p className="mt-6 max-w-2xl text-xl font-medium leading-8 text-slate-300">
            Access your SiteVerdict dashboard to create assessments, review
            submitted walkthroughs, watch candidate videos, and inspect AI
            transcripts.
          </p>

          <div className="mt-10 grid max-w-2xl gap-4">
            {[
              "Passwordless secure access",
              "Assessment and submission dashboard",
              "Video, transcript, and verdict review",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <CheckCircle2 className="h-5 w-5 text-blue-300" />
                <span className="font-semibold text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-2 shadow-2xl shadow-blue-950/40 backdrop-blur-xl">
            <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/80 p-8 md:p-10">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30">
                <LockKeyhole className="h-7 w-7 text-white" />
              </div>

              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
                Admin Login
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-[-0.02em] text-white">
                Enter command center.
              </h2>

              <p className="mt-4 text-base font-medium leading-7 text-slate-400">
                We’ll send a secure magic link to your email. No password
                required.
              </p>

              <form onSubmit={handleLogin} className="mt-8 space-y-4">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 rounded-2xl border-white/10 bg-white/5 pl-12 text-base font-semibold text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSending}
                  className="h-14 w-full rounded-2xl bg-blue-600 text-base font-black text-white shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-500"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending magic link...
                    </>
                  ) : (
                    <>
                      Send Magic Link
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" />
                  <p className="text-sm font-medium leading-6 text-slate-400">
                    Access is currently limited to approved pilot accounts and
                    project administrators.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs font-semibold text-slate-500">
            © 2026 Dunn Strategic Consulting, LLC
          </p>
        </div>
      </section>
    </main>
  );
}
