"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  CheckCircle2,
  Clipboard,
  ClipboardCheck,
  Copy,
  FileImage,
  Loader2,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

type CreatedAssessment = {
  id: string;
  title: string;
};

const priorityOptions = [
  { value: "normal", label: "Normal" },
  { value: "high", label: "High Priority" },
  { value: "critical", label: "Critical" },
];

export default function NewAssessmentPage() {
  const router = useRouter();
  const supabase = createClient();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [promptText, setPromptText] = useState("");
  const [keywords, setKeywords] = useState("");
  const [priority, setPriority] = useState("normal");
  const [questions, setQuestions] = useState<string[]>([
    "Walk through what you see and identify any safety concerns.",
  ]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [createdAssessment, setCreatedAssessment] =
    useState<CreatedAssessment | null>(null);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/login?next=/dashboard/new");
        return;
      }

      setUserId(user.id);
      setCheckingAuth(false);
    }

    checkUser();
  }, [router, supabase]);

  const candidateLink = useMemo(() => {
    if (!createdAssessment?.id) return "";

    if (typeof window === "undefined") {
      return `/test/${createdAssessment.id}`;
    }

    return `${window.location.origin}/test/${createdAssessment.id}`;
  }, [createdAssessment]);

  function addQuestion() {
    if (questions.length >= 10) {
      toast.error("You can add up to 10 questions.");
      return;
    }

    setQuestions((current) => [...current, ""]);
  }

  function updateQuestion(index: number, value: string) {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? value : question,
      ),
    );
  }

  function removeQuestion(index: number) {
    setQuestions((current) => {
      const next = current.filter(
        (_, questionIndex) => questionIndex !== index,
      );
      return next.length > 0 ? next : [""];
    });
  }

  async function copyCandidateLink() {
    if (!candidateLink) return;

    await navigator.clipboard.writeText(candidateLink);

    toast.success("Candidate link copied", {
      description: "Send this link to the subcontractor or trade candidate.",
    });
  }

  async function uploadAssessmentImage(assessmentId: string) {
    if (!imageFile) return "";

    const extension = imageFile.name.split(".").pop() || "jpg";
    const filePath = `${assessmentId}/${crypto.randomUUID()}.${extension}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("assessments")
      .upload(filePath, imageFile, {
        contentType: imageFile.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("assessments")
      .getPublicUrl(uploadData.path);

    return publicUrlData.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!userId) {
      toast.error("You must be logged in to create an assessment.");
      router.push("/login?next=/dashboard/new");
      return;
    }

    const cleanTitle = title.trim();
    const cleanPrompt = promptText.trim();

    const cleanQuestions = questions
      .map((question) => question.trim())
      .filter(Boolean);

    const requiredKeywords = keywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    if (!cleanTitle || !cleanPrompt) {
      toast.error("Add a title and assessment instructions.");
      return;
    }

    setLoading(true);

    const toastId = toast.loading("Creating assessment...");

    try {
      const { data: assessment, error: insertError } = await supabase
        .from("assessments")
        .insert({
          employer_id: userId,
          title: cleanTitle,
          prompt_text: cleanPrompt,
          required_keywords: requiredKeywords,
          questions: cleanQuestions,
          is_active: true,
          priority,
        })
        .select("id, title")
        .single();

      if (insertError || !assessment) {
        throw new Error(insertError?.message || "Assessment creation failed.");
      }

      let problemImageUrl = "";

      if (imageFile) {
        toast.loading("Uploading assessment image...", { id: toastId });

        problemImageUrl = await uploadAssessmentImage(assessment.id);

        const { error: imageUpdateError } = await supabase
          .from("assessments")
          .update({
            problem_image_url: problemImageUrl,
          })
          .eq("id", assessment.id);

        if (imageUpdateError) {
          throw new Error(
            `Assessment created, but image update failed: ${imageUpdateError.message}`,
          );
        }
      }

      toast.success("Assessment created", {
        id: toastId,
        description: "Your candidate test link is ready.",
      });

      setCreatedAssessment({
        id: assessment.id,
        title: assessment.title,
      });
    } catch (error: unknown) {
      console.error("Assessment creation error:", error);

      toast.error("Could not create assessment", {
        id: toastId,
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
            Checking authentication...
          </div>
        </div>
      </main>
    );
  }

  if (createdAssessment) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-950 dark:bg-slate-950 dark:text-white md:p-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[2rem] border border-emerald-200 bg-white p-8 shadow-2xl shadow-slate-200/70 dark:border-emerald-400/20 dark:bg-white/[0.06] dark:shadow-blue-950/20 md:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <p className="mt-8 text-xs font-black uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-300">
              Assessment created
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-[-0.015em] text-slate-950 dark:text-white">
              Candidate link is ready.
            </h1>

            <p className="mt-4 text-base font-medium leading-7 text-slate-600 dark:text-slate-300">
              Send this link to the subcontractor, technician, or trade
              candidate. Their recorded response will appear in your dashboard
              after submission.
            </p>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                {createdAssessment.title}
              </p>

              <div className="mt-3 flex flex-col gap-3 md:flex-row">
                <input
                  value={candidateLink}
                  readOnly
                  className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200"
                />

                <Button
                  type="button"
                  onClick={copyCandidateLink}
                  className="h-12 rounded-xl bg-blue-600 px-5 font-black text-white hover:bg-blue-700"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Link
                href={`/test/${createdAssessment.id}`}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-blue-600 dark:bg-white dark:text-slate-950 dark:hover:bg-blue-500 dark:hover:text-white"
              >
                Open Test
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:bg-white/10"
              >
                Dashboard
              </Link>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreatedAssessment(null);
                  setTitle("");
                  setPromptText("");
                  setKeywords("");
                  setQuestions([
                    "Walk through what you see and identify any safety concerns.",
                  ]);
                  setImageFile(null);
                  setPriority("normal");
                }}
                className="h-12 rounded-xl border-slate-200 font-black dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200"
              >
                Create Another
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950 dark:bg-slate-950 dark:text-white md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600 dark:text-blue-300">
              Assessment Builder
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.015em] text-slate-950 dark:text-white md:text-5xl">
              Create a trade assessment.
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-600 dark:text-slate-300">
              Build a focused test link for a candidate. They’ll record a video
              walkthrough, and SiteVerdict will capture the submission for
              review.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:bg-white/10"
          >
            Back to Dashboard
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[1fr_0.75fr]"
        >
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05] md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Core details
                </p>
                <h2 className="text-xl font-black tracking-[-0.01em]">
                  Assessment setup
                </h2>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Assessment title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Electrical: Panel Inspection"
                  required
                  className="mt-2 h-12 rounded-xl border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Candidate instructions
                </label>
                <Textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Ask the candidate to inspect the image, explain what they see, identify risks, and describe the next step."
                  rows={6}
                  required
                  className="mt-2 rounded-xl border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Required keywords
                </label>
                <Input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="breaker, double tap, grounding, permit"
                  className="mt-2 h-12 rounded-xl border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900"
                />
                <p className="mt-2 text-xs font-medium text-slate-500">
                  Comma-separated terms the AI/reviewer should look for.
                </p>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                    Controls
                  </p>
                  <h2 className="text-xl font-black tracking-[-0.01em]">
                    Test settings
                  </h2>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Problem image
                  </label>
                  <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50 dark:border-white/10 dark:bg-slate-900 dark:hover:bg-blue-500/10">
                    <FileImage className="h-7 w-7 text-blue-600 dark:text-blue-300" />
                    <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                      {imageFile ? imageFile.name : "Upload optional image"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      JPG, PNG, or WebP
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setImageFile(e.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                </div>
              </div>
            </section>

            <Button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-2xl bg-blue-600 text-base font-black text-white shadow-xl shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 dark:shadow-blue-950/30"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating assessment...
                </>
              ) : (
                <>
                  Create Assessment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </aside>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05] md:p-8 lg:col-span-2">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <Clipboard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                    Walkthrough prompts
                  </p>
                  <h2 className="text-xl font-black tracking-[-0.01em]">
                    Candidate questions
                  </h2>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addQuestion}
                className="rounded-xl border-slate-200 font-black dark:border-white/10 dark:bg-white/[0.06]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>

            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                    {index + 1}
                  </div>

                  <Input
                    value={question}
                    onChange={(e) => updateQuestion(index, e.target.value)}
                    placeholder="Ask the candidate to explain a specific inspection step..."
                    className="h-12 rounded-xl border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900"
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeQuestion(index)}
                    className="h-12 w-12 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}
