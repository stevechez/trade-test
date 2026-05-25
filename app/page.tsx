"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Video,
  Zap,
  Mail,
  MapPin,
  ExternalLink,
} from "lucide-react";
import LeadForm from "@/components/LeadForm";
import ThemeToggle from "@/components/ThemeToggle";
import { createClient } from "@/lib/supabase";
import Image from "next/image";

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setIsLoggedIn(Boolean(session));
      } catch {
        setIsLoggedIn(false);
      }
    }

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-950 selection:bg-blue-100 dark:bg-slate-950 dark:text-white dark:selection:bg-blue-500/30">
      <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <span className="text-xl font-black tracking-[-0.01em]">
              SiteVerdict
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#how-it-works"
              className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            >
              How it works
            </a>
            <a
              href="#pilot"
              className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            >
              Pilot
            </a>
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            >
              {isLoggedIn ? "Dashboard" : "Sign in"}
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              href={isLoggedIn ? "/dashboard" : "#pilot"}
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-600 dark:bg-white dark:text-slate-950 dark:hover:bg-blue-500 dark:hover:text-white"
            >
              {isLoggedIn ? "Open Dashboard" : "Request Access"}
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.14),transparent_38%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)] dark:bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.28),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.16),transparent_32%),linear-gradient(to_bottom,_#020617,_#0f172a)]" />

          <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 md:grid-cols-[1.1fr_0.9fr] md:py-32">
            <div>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-300" />
                </span>
                Contractor Pilot Open
              </div>

              <h1 className="max-w-5xl text-5xl font-black leading-[1.03] tracking-[-0.02em] text-slate-950 md:text-7xl lg:text-8xl dark:text-white">
                Know who can actually do the work.
              </h1>

              <p className="mt-8 max-w-2xl text-xl font-medium leading-8 text-slate-600 md:text-2xl md:leading-9 dark:text-slate-300">
                SiteVerdict helps contractors evaluate subcontractor field
                judgment with video-based trade assessments, AI transcripts, and
                review-ready audit reports.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href={isLoggedIn ? "/dashboard" : "#pilot"}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-5 text-lg font-black text-white shadow-2xl shadow-blue-200 transition-all hover:-translate-y-1 hover:bg-blue-700 dark:shadow-blue-950/40"
                >
                  {isLoggedIn ? (
                    <>
                      <LayoutDashboard className="h-5 w-5 transition-transform group-hover:rotate-12" />
                      Launch Command Center
                    </>
                  ) : (
                    <>
                      Request Pilot Access
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Link>

                <button
                  onClick={() =>
                    document
                      .getElementById("how-it-works")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-5 text-lg font-black text-slate-700 shadow-sm transition-all hover:-translate-y-1 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  <PlayCircle className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  See how it works
                </button>
              </div>

              <div className="mt-10 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
                {["Video proof", "AI transcript", "Review-ready verdict"].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300"
                    >
                      <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                      {item}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-blue-100/60 blur-3xl dark:bg-blue-500/20" />

              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200 dark:border-white/10 dark:bg-white/[0.06] dark:shadow-blue-950/30 dark:backdrop-blur-xl">
                <div className="border-b border-slate-100 px-6 py-5 dark:border-white/10">
                  <div className="flex items-center justify-between gap-6">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                        Assessment Review
                      </p>
                      <h3 className="mt-1 text-lg font-black tracking-[-0.01em] text-slate-950 dark:text-white">
                        Electrical: Panel Inspection
                      </h3>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                      Processed
                    </span>
                  </div>
                </div>

                <div className="space-y-5 p-6">
                  <div className="rounded-2xl bg-slate-950 p-5 text-white ring-1 ring-white/10">
                    <div className="flex items-center gap-3">
                      <Video className="h-5 w-5 text-blue-300" />
                      <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-300">
                        Candidate Video
                      </p>
                    </div>
                    <div className="mt-5 h-36 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 ring-1 ring-white/10">
                      <Image
                        src="/images/hero-image.png"
                        alt="Video thumbnail showing a jobsite panel with breakers and conduit"
                        width={400}
                        height={200}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.05]">
                      <ClipboardCheck className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                        Transcript
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">
                        “Breaker labeling is incomplete. I would verify load
                        path and check for double taps…”
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.05]">
                      <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                        Verdict
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">
                        Strong field awareness. Needs follow-up on code citation
                        and sign-off protocol.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-400/20 dark:bg-blue-400/10">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700 dark:text-blue-200">
                      Review-ready report
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">
                      Candidate response, video evidence, transcript, and AI
                      summary are organized for contractor review.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-y border-slate-100 bg-slate-50 py-24 dark:border-white/10 dark:bg-slate-900/70"
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600 dark:text-blue-300">
                The SiteVerdict workflow
              </p>
              <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.015em] text-slate-950 md:text-6xl dark:text-white">
                A practical skills check, not another form.
              </h2>
              <p className="mt-6 text-lg font-medium leading-8 text-slate-600 dark:text-slate-300">
                Create a trade-specific prompt, send the test link, and review
                the candidate’s real explanation before assigning work.
              </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: ClipboardCheck,
                  title: "Create the assessment",
                  body: "Build a focused trade prompt with keywords, questions, and jobsite context.",
                },
                {
                  icon: Video,
                  title: "Capture the response",
                  body: "Candidates record a short walkthrough explaining what they see and what they would do.",
                },
                {
                  icon: FileText,
                  title: "Review the verdict",
                  body: "Get the uploaded video, transcript, AI summary, and review-ready audit in one place.",
                },
              ].map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.05]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <p className="mt-8 text-xs font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-3 text-2xl font-black tracking-[-0.01em] text-slate-950 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-base font-medium leading-7 text-slate-600 dark:text-slate-300">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-24 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600 dark:text-blue-300">
                  Built for trade operators
                </p>
                <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.015em] text-slate-950 md:text-6xl dark:text-white">
                  Reduce guesswork before the crew shows up.
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "Screen subcontractors with practical scenarios",
                  "Document candidate judgment with video proof",
                  "Catch communication gaps before the jobsite",
                  "Create a repeatable review process",
                  "Store every submission in one dashboard",
                  "Turn raw walkthroughs into reviewable reports",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.05]"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-300" />
                    <p className="text-sm font-bold leading-6 text-slate-700 dark:text-slate-300">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="pilot"
          className="relative overflow-hidden border-t border-slate-100 bg-white py-24 text-slate-950 dark:border-white/10 dark:bg-slate-950 dark:text-white"
        >
          <div className="absolute inset-0 opacity-70 [background:radial-gradient(circle_at_top_right,_rgba(37,99,235,0.16),transparent_35%)] dark:opacity-40 dark:[background:radial-gradient(circle_at_top_right,_#2563eb,_transparent_35%)]" />

          <div className="relative mx-auto grid max-w-7xl gap-16 px-6 md:grid-cols-2 md:items-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-blue-700 dark:border-white/10 dark:bg-white/5 dark:text-blue-200">
                <Sparkles className="h-4 w-4" />
                Limited Pilot
              </div>

              <h2 className="text-4xl font-black leading-tight tracking-[-0.015em] text-slate-950 md:text-6xl dark:text-white">
                Join the contractor pilot.
              </h2>

              <p className="mt-6 text-lg font-medium leading-8 text-slate-600 dark:text-slate-300">
                We’re onboarding a small group of contractors and trade
                businesses to shape the next version of SiteVerdict.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  "First assessment workflow setup",
                  "Video submission and review dashboard",
                  "AI transcript and summary pipeline",
                  "Early input on features before public launch",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-base font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/70 dark:border-white/10 dark:bg-white/[0.06] dark:shadow-blue-950/30 md:p-8">
              <div className="rounded-[1.5rem] bg-white p-1 dark:bg-white">
                <LeadForm />
              </div>
            </div>
          </div>
        </section>
        <footer className="border-t border-slate-100 bg-white py-16 dark:border-white/10 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
              <div>
                <Link href="/" className="inline-flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950">
                    <Zap className="h-5 w-5 fill-current" />
                  </div>
                  <span className="text-xl font-black tracking-[-0.01em] text-slate-950 dark:text-white">
                    SiteVerdict
                  </span>
                </Link>

                <p className="mt-5 max-w-sm text-sm font-medium leading-7 text-slate-600 dark:text-slate-400">
                  Video-based trade assessments, AI transcripts, and
                  review-ready verdicts for contractors who need to know who can
                  actually do the work.
                </p>

                <div className="mt-6 flex flex-col gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    Santa Cruz County pilot
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    <a
                      href="mailto:1catalystvirtualassistant@gmail.com"
                      className="transition-colors hover:text-slate-950 dark:hover:text-white"
                    >
                      1catalystvirtualassistant@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                  Product
                </h3>
                <ul className="mt-5 space-y-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  <li>
                    <a
                      href="#how-it-works"
                      className="hover:text-slate-950 dark:hover:text-white"
                    >
                      How it works
                    </a>
                  </li>
                  <li>
                    <a
                      href="#pilot"
                      className="hover:text-slate-950 dark:hover:text-white"
                    >
                      Contractor pilot
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      className="hover:text-slate-950 dark:hover:text-white"
                    >
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard"
                      className="hover:text-slate-950 dark:hover:text-white"
                    >
                      Dashboard
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                  Use Cases
                </h3>
                <ul className="mt-5 space-y-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  <li>Subcontractor vetting</li>
                  <li>Trade assessments</li>
                  <li>Video walkthrough review</li>
                  <li>AI transcript records</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                  Company
                </h3>
                <ul className="mt-5 space-y-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  <li>
                    <Link
                      href="/privacy"
                      className="hover:text-slate-950 dark:hover:text-white"
                    >
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="hover:text-slate-950 dark:hover:text-white"
                    >
                      Terms
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#pilot"
                      className="inline-flex items-center gap-1 hover:text-slate-950 dark:hover:text-white"
                    >
                      Request access
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-14 flex flex-col gap-4 border-t border-slate-100 pt-8 text-sm font-semibold text-slate-400 dark:border-white/10 dark:text-slate-500 md:flex-row md:items-center md:justify-between">
              <p>© 2026 Dunn Strategic Consulting, LLC. All rights reserved.</p>

              <p>
                Built for contractors, trade operators, and field-first teams.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
