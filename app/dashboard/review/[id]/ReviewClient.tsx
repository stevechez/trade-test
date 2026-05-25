"use client";

import {
  Printer,
  Mail,
  Loader2,
  FileText,
  User,
  Video,
  Brain,
  ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";
import { useState } from "react";
import { toast } from "sonner";

interface ReviewClientProps {
  submission: {
    id: string;
    assessment_id?: string | null;
    candidate_name?: string | null;
    candidate_email?: string | null;
    email?: string | null;
    user_email?: string | null;
    video_url?: string | null;
    transcript?: string | null;
    ai_score?: number | null;
    ai_summary?: string | null;
    status?: string | null;
    created_at?: string | null;
    assessments?: {
      id?: string;
      title?: string | null;
      prompt_text?: string | null;
      problem_image_url?: string | null;
    } | null;
  };
}

export default function ReviewClient({ submission }: ReviewClientProps) {
  const [isSending, setIsSending] = useState(false);
  const supabase = createClient();

  const targetEmail =
    submission.candidate_email ||
    submission.email ||
    submission.user_email ||
    "";

  const candidateName = submission.candidate_name || "Unnamed Candidate";
  const assessmentTitle = submission.assessments?.title || "Residential Site";
  const status = submission.status || "pending";
  const aiSummary = submission.ai_summary || "No AI summary available yet.";
  const transcript = submission.transcript || "No transcript available.";
  const videoUrl = submission.video_url;

  const handleNotifyContractor = async () => {
    if (!targetEmail) {
      toast.error("No recipient email found for this audit.");
      return;
    }

    setIsSending(true);

    const toastId = toast.loading("Transmitting official report...");

    try {
      const { data, error } = await supabase.functions.invoke("notify-fix", {
        body: {
          submission_id: submission.id,
          auditId: submission.id,
          recipient: targetEmail,
          candidate_email: targetEmail,
          candidate_name: candidateName,
          assessment_title: assessmentTitle,
          address: assessmentTitle,
          ai_summary: aiSummary,
          transcript,
          video_url: videoUrl,
        },
      });

      if (error) {
        console.error("notify-fix edge function error:", error);
        throw error;
      }

      console.log("notify-fix response:", data);

      toast.success("Notification Sent", {
        description: `Official report delivered to ${targetEmail}`,
        id: toastId,
      });
    } catch (error: unknown) {
      console.error("Function Error:", error);

      toast.error("Transmission Failed", {
        description:
          error instanceof Error
            ? error.message
            : "Verify Supabase Edge Function connectivity.",
        id: toastId,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in duration-500 p-4 md:p-8">
      <div className="no-print mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Audit Review
          </h1>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Recipient:{" "}
            <span className="text-blue-600">
              {targetEmail || "Not Assigned"}
            </span>
          </p>
        </div>

        <div className="flex w-full gap-3 md:w-auto">
          <Button
            onClick={handleNotifyContractor}
            disabled={isSending}
            variant="default"
            className="flex-1 items-center gap-2 rounded-xl bg-slate-900 font-bold text-white transition-all hover:bg-blue-600 md:flex-none"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            {isSending ? "Sending..." : "Notify Contractor"}
          </Button>

          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="flex-1 items-center gap-2 rounded-xl border-slate-200 font-bold md:flex-none"
          >
            <Printer className="h-4 w-4" />
            Export Official Report
          </Button>
        </div>
      </div>

      <div className="print:block overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-sm md:p-12">
        <header className="mb-10 flex items-end justify-between border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">
              SiteVerdict
            </h2>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">
              Technical Compliance Audit
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">
              {assessmentTitle}
            </p>
            <p className="text-[10px] font-medium text-slate-400">
              ID: {submission.id.slice(0, 8)}
            </p>
          </div>
        </header>

        <div className="mb-8 rounded-2xl border border-slate-100 bg-slate-50 p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-100 p-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>

            <div>
              <p className="text-sm font-bold uppercase text-slate-900">
                Status: {status}
              </p>
              <p className="text-xs text-slate-500">
                Ready for contractor verification and sign-off.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-3">
                <User className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Candidate
                </p>
                <h3 className="mt-1 text-2xl font-black text-slate-950">
                  {candidateName}
                </h3>
              </div>
            </div>

            <div className="mt-4 space-y-1 text-sm text-slate-500">
              <p>{targetEmail || "No email available."}</p>
              {submission.created_at && (
                <p>
                  Submitted: {new Date(submission.created_at).toLocaleString()}
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-3">
                <Brain className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  AI Verdict
                </p>
                <h3 className="mt-1 text-2xl font-black text-slate-950">
                  {submission.ai_score != null
                    ? `${submission.ai_score}/100`
                    : "Pending Score"}
                </h3>
              </div>
            </div>

            <p className="mt-4 text-base leading-7 text-slate-700">
              {aiSummary}
            </p>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-3">
              <Video className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Candidate Video
              </p>
              <p className="text-sm text-slate-500">
                Recorded field assessment response.
              </p>
            </div>
          </div>

          {videoUrl ? (
            <video
              controls
              src={videoUrl}
              className="w-full rounded-2xl border border-slate-200 bg-black"
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-slate-500">
              No video available for this submission.
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-3">
              <ScrollText className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Transcript
              </p>
              <p className="text-sm text-slate-500">
                Raw or generated transcript from the submitted video.
              </p>
            </div>
          </div>

          <p className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">
            {transcript}
          </p>
        </section>

        <footer className="mt-12 border-t border-slate-50 pt-6 text-center">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300">
            © 2026 Dunn Strategic Consulting, LLC • Confidential Technical Audit
          </p>
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
            padding: 0 !important;
          }

          .print\\:block {
            display: block !important;
            border: none !important;
            box-shadow: none !important;
          }

          video {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
