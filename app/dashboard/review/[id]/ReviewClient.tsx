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
  ExternalLink,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
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

function extractStoragePath(videoUrl: string | null | undefined) {
  if (!videoUrl) return null;

  if (!videoUrl.startsWith("http")) {
    return videoUrl;
  }

  try {
    const url = new URL(videoUrl);

    const publicMarker = "/storage/v1/object/public/site-videos/";
    const signedMarker = "/storage/v1/object/sign/site-videos/";

    if (url.pathname.includes(publicMarker)) {
      return decodeURIComponent(url.pathname.split(publicMarker)[1]);
    }

    if (url.pathname.includes(signedMarker)) {
      return decodeURIComponent(url.pathname.split(signedMarker)[1]);
    }

    return null;
  } catch {
    return videoUrl;
  }
}

export default function ReviewClient({ submission }: ReviewClientProps) {
  const [isSending, setIsSending] = useState(false);
  const [signedVideoUrl, setSignedVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

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

  useEffect(() => {
    async function signVideoUrl() {
      setSignedVideoUrl(null);
      setVideoError(null);

      const storagePath = extractStoragePath(videoUrl);

      if (!storagePath) {
        setVideoError("No video path found for this submission.");
        return;
      }

      const { data, error } = await supabase.storage
        .from("site-videos")
        .createSignedUrl(storagePath, 60 * 60);

      if (error || !data?.signedUrl) {
        console.error("Video signing error:", error);
        setVideoError(error?.message || "Could not create signed video URL.");
        return;
      }

      setSignedVideoUrl(data.signedUrl);
    }

    signVideoUrl();
  }, [videoUrl, supabase]);

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
    <div className="mx-auto max-w-7xl animate-in fade-in p-4 duration-500 md:p-8">
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

          {signedVideoUrl ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-black">
              <video
                key={signedVideoUrl}
                controls
                playsInline
                preload="metadata"
                className="aspect-video w-full bg-black"
              >
                <source src={signedVideoUrl} type="video/webm" />
                <source src={signedVideoUrl} type="video/mp4" />
                <source src={signedVideoUrl} type="video/quicktime" />
                Your browser does not support this video format.
              </video>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-950 px-4 py-3">
                <p className="text-xs font-semibold text-slate-400">
                  If playback fails in this browser, open the original file
                  directly.
                </p>

                <div className="flex gap-2">
                  <a
                    href={signedVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center justify-center rounded-xl bg-white px-3 text-xs font-black text-slate-950 transition hover:bg-blue-100"
                  >
                    <ExternalLink className="mr-2 h-3.5 w-3.5" />
                    Open Video
                  </a>

                  <a
                    href={signedVideoUrl}
                    download
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-white/15 px-3 text-xs font-black text-white transition hover:bg-white/10"
                  >
                    <Download className="mr-2 h-3.5 w-3.5" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm font-bold text-slate-500">
                {videoError ||
                  "No playable video URL was found for this submission."}
              </p>
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
