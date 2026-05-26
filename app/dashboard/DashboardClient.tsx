"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import MobileBottomNav from "@/components/MobileBottomNav";
import LogoutButton from "@/components/LogoutButton";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCopy,
  ExternalLink,
  FileText,
  Link2,
  Loader2,
  PlusCircle,
  Search,
  ShieldCheck,
  Video,
  X,
} from "lucide-react";

type Submission = {
  id: string;
  created_at: string;
  candidate_name?: string | null;
  candidate_email?: string | null;
  status?: string | null;
  transcript?: string | null;
  ai_summary?: string | null;
  video_url?: string | null;
  assessment_id?: string | null;
  assessments?: {
    id?: string | null;
    title?: string | null;
    prompt_text?: string | null;
  } | null;
};

type Assessment = {
  id: string;
  title: string | null;
  is_active: boolean | null;
  created_at: string | null;
  priority?: string | null;
};

export default function DashboardClient({
  initialSubmissions,
}: {
  initialSubmissions: Submission[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadAssessments() {
      setLoadingAssessments(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoadingAssessments(false);
        return;
      }

      const { data, error } = await supabase
        .from("assessments")
        .select("id, title, is_active, created_at, priority")
        .eq("employer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) {
        console.error("Assessment load error:", error);
        toast.error("Could not load assessment links.");
      } else {
        setAssessments(data || []);
      }

      setLoadingAssessments(false);
    }

    loadAssessments();
  }, [supabase]);

  const filteredSubmissions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return initialSubmissions;

    return initialSubmissions.filter((sub) => {
      const title = sub.assessments?.title?.toLowerCase() || "";
      const email = sub.candidate_email?.toLowerCase() || "";
      const name = sub.candidate_name?.toLowerCase() || "";
      const status = sub.status?.toLowerCase() || "";

      return (
        title.includes(search) ||
        email.includes(search) ||
        name.includes(search) ||
        status.includes(search)
      );
    });
  }, [initialSubmissions, searchTerm]);

  const processedCount = initialSubmissions.filter(
    (sub) => sub.status?.toLowerCase() === "processed",
  ).length;

  const pendingCount = initialSubmissions.filter(
    (sub) => sub.status?.toLowerCase() !== "processed",
  ).length;

  function getCandidateLink(assessmentId: string) {
    if (typeof window === "undefined") return `/test/${assessmentId}`;
    return `${window.location.origin}/test/${assessmentId}`;
  }

  async function copyCandidateLink(assessmentId: string) {
    const link = getCandidateLink(assessmentId);

    await navigator.clipboard.writeText(link);

    toast.success("Candidate link copied", {
      description: "Send this link to a subcontractor or trade candidate.",
    });
  }

  return (
    <div className="mx-auto max-w-7xl animate-in slide-in-from-bottom-2 p-4 pb-28 duration-500 md:p-8 md:pb-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
            SiteVerdict Dashboard
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-[-0.02em] text-slate-950 md:text-5xl">
            Command Center
          </h1>

          <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-500 md:text-lg">
            Create assessment links, review candidate videos, and manage
            review-ready trade verdicts.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
          <Button
            asChild
            className="h-12 rounded-2xl bg-blue-600 px-5 font-black text-white hover:bg-blue-700"
          >
            <Link href="/dashboard/new">
              <PlusCircle className="mr-2 h-5 w-5" />
              New Assessment
            </Link>
          </Button>

          <LogoutButton />
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            Assessments
          </p>
          <p className="mt-3 text-3xl font-black text-slate-950">
            {assessments.length}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Active test links
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            Submissions
          </p>
          <p className="mt-3 text-3xl font-black text-slate-950">
            {initialSubmissions.length}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Candidate responses
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            Processed
          </p>
          <p className="mt-3 text-3xl font-black text-slate-950">
            {processedCount}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Ready for review
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            Pending
          </p>
          <p className="mt-3 text-3xl font-black text-slate-950">
            {pendingCount}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Still processing
          </p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Link
          href="/dashboard/new"
          className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <PlusCircle className="h-6 w-6" />
          </div>

          <h2 className="mt-5 text-xl font-black text-slate-950">
            Create Assessment
          </h2>

          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
            Build a new candidate test link for a trade walkthrough.
          </p>

          <div className="mt-5 inline-flex items-center text-sm font-black text-blue-600">
            Start builder
            <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
          </div>
        </Link>

        <a
          href="#recent-submissions"
          className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Video className="h-6 w-6" />
          </div>

          <h2 className="mt-5 text-xl font-black text-slate-950">
            Review Submissions
          </h2>

          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
            Watch candidate videos, read transcripts, and inspect AI summaries.
          </p>

          <div className="mt-5 inline-flex items-center text-sm font-black text-blue-600">
            View queue
            <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
          </div>
        </a>

        <a
          href="#assessment-links"
          className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <Link2 className="h-6 w-6" />
          </div>

          <h2 className="mt-5 text-xl font-black text-slate-950">
            Share Test Links
          </h2>

          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
            Copy active assessment links and send them to subcontractors.
          </p>

          <div className="mt-5 inline-flex items-center text-sm font-black text-blue-600">
            Copy links
            <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
          </div>
        </a>
      </div>

      <section
        id="assessment-links"
        className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6"
      >
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Active assessment links
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.01em] text-slate-950">
              Send candidates here first.
            </h2>
          </div>

          <Button
            asChild
            variant="outline"
            className="h-11 rounded-xl border-slate-200 font-black"
          >
            <Link href="/dashboard/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New
            </Link>
          </Button>
        </div>

        {loadingAssessments ? (
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading assessment links...
          </div>
        ) : assessments.length > 0 ? (
          <div className="grid gap-3">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-black text-slate-950">
                      {assessment.title || "Untitled Assessment"}
                    </h3>

                    <Badge variant="secondary" className="rounded-full">
                      {assessment.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <p className="mt-1 truncate text-sm font-medium text-slate-500">
                    {getCandidateLink(assessment.id)}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    onClick={() => copyCandidateLink(assessment.id)}
                    variant="outline"
                    className="h-10 rounded-xl border-slate-200 font-black"
                  >
                    <ClipboardCopy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>

                  <Button
                    asChild
                    className="h-10 rounded-xl bg-slate-950 font-black text-white hover:bg-blue-600"
                  >
                    <Link href={`/test/${assessment.id}`} target="_blank">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <h3 className="text-xl font-black text-slate-950">
              No assessment links yet.
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-7 text-slate-500">
              Create your first assessment. SiteVerdict will generate a
              candidate link you can copy and send.
            </p>

            <Button
              asChild
              className="mt-5 h-11 rounded-xl bg-blue-600 px-5 font-black text-white hover:bg-blue-700"
            >
              <Link href="/dashboard/new">Create Assessment</Link>
            </Button>
          </div>
        )}
      </section>

      <section
        id="recent-submissions"
        className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6"
      >
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Review queue
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.01em] text-slate-950">
              Recent candidate submissions
            </h2>
          </div>

          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              placeholder="Search by candidate, status, or assessment..."
              className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11 pr-10 font-semibold shadow-sm focus-visible:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition hover:bg-slate-200"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {filteredSubmissions.length > 0 ? (
          <div className="space-y-4">
            {filteredSubmissions.map((sub) => {
              const normalizedStatus = sub.status || "pending";
              const isProcessed =
                normalizedStatus.toLowerCase() === "processed";

              return (
                <div
                  key={sub.id}
                  className="group flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4 md:w-56">
                    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                      <FileText className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Logged
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge
                        variant={isProcessed ? "default" : "secondary"}
                        className="rounded-full text-[10px] uppercase"
                      >
                        {normalizedStatus}
                      </Badge>

                      {sub.video_url && (
                        <Badge
                          variant="outline"
                          className="rounded-full text-[10px] uppercase"
                        >
                          Video
                        </Badge>
                      )}

                      {sub.transcript && (
                        <Badge
                          variant="outline"
                          className="rounded-full text-[10px] uppercase"
                        >
                          Transcript
                        </Badge>
                      )}
                    </div>

                    <h4 className="truncate text-lg font-black leading-tight text-slate-900">
                      {sub.assessments?.title || "General Trade Assessment"}
                    </h4>

                    <p className="mt-1 truncate text-sm font-medium text-slate-500">
                      {sub.candidate_name || "Unnamed Candidate"}{" "}
                      {sub.candidate_email ? `• ${sub.candidate_email}` : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0">
                    <Button
                      asChild
                      className="w-full rounded-xl bg-slate-950 px-6 font-bold text-white hover:bg-blue-600 md:w-auto"
                    >
                      <Link
                        href={`/dashboard/review/${sub.id}`}
                        className="flex items-center gap-2"
                      >
                        Review Submission
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
              <ShieldCheck className="h-7 w-7" />
            </div>

            <h3 className="mt-5 text-2xl font-black text-slate-950">
              {searchTerm ? "No matching submissions." : "No submissions yet."}
            </h3>

            <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-7 text-slate-500">
              {searchTerm
                ? "Try a different candidate email, assessment title, or status."
                : "Create an assessment, copy the candidate link, and send it to a trade candidate. Their video walkthrough will appear here after submission."}
            </p>

            {!searchTerm && (
              <div className="mt-6 flex justify-center gap-3">
                <Button
                  asChild
                  className="h-12 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700"
                >
                  <Link href="/dashboard/new">Create Assessment</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      <footer className="no-print mt-20 border-t border-slate-100 py-10">
        <div className="flex flex-col items-center justify-between gap-6 text-sm text-slate-500 md:flex-row">
          <div className="flex items-center gap-2 font-medium text-slate-900">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            Dunn Strategic Consulting LLC
          </div>

          <div className="flex flex-wrap justify-center gap-6 font-bold">
            <Link href="/privacy" className="hover:text-blue-600">
              Privacy
            </Link>

            <Link
              href="mailto:support@siteverdict.online"
              className="hover:text-blue-600"
            >
              Support
            </Link>

            <span className="font-normal text-slate-300">
              © 2026 SiteVerdict
            </span>
          </div>
        </div>
      </footer>
      <MobileBottomNav />
    </div>
  );
}
