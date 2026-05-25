"use client";

import { useState } from "react";
import CandidateRecorder from "@/components/CandidateRecorder";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function TestClientWrapper({ assessment }: { assessment: any }) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!assessment) return null;

  const questions =
    assessment.questions && assessment.questions.length > 0
      ? assessment.questions
      : [assessment.prompt_text];

  const handleUpload = async (blob: Blob) => {
    if (isSubmitting) return;

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    const toastId = toast.loading("Uploading your walkthrough...");

    const filePath = `${assessment.id}/${crypto.randomUUID()}.webm`;

    try {
      // 1. Upload video to the correct bucket.
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("site-videos")
        .upload(filePath, blob, {
          contentType: "video/webm",
          upsert: false,
        });

      if (uploadError) {
        console.error("Video upload failed:", uploadError);
        throw new Error(`Storage failure: ${uploadError.message}`);
      }

      if (!uploadData?.path) {
        throw new Error("Video upload did not return a storage path.");
      }

      toast.loading("Saving your submission...", { id: toastId });

      // 2. Insert submission only after upload succeeds.
      const { data: newSubmission, error: dbError } = await supabase
        .from("submissions")
        .insert({
          assessment_id: assessment.id,
          candidate_name: candidateName.trim() || null,
          candidate_email: email.trim().toLowerCase(),
          video_url: uploadData.path,
          status: "processing",
        })
        .select("id")
        .single();

      if (dbError) {
        console.error("Submission insert failed:", dbError);
        throw new Error(`Database sync failed: ${dbError.message}`);
      }

      if (!newSubmission?.id) {
        throw new Error("Submission insert did not return an ID.");
      }

      // 3. Trigger transcription/AI processing.
      toast.loading("AI is analyzing your video...", { id: toastId });

      const { error: aiError } = await supabase.functions.invoke(
        "transcribe-video",
        {
          body: {
            submissionId: newSubmission.id,
          },
        },
      );

      if (aiError) {
        console.error("AI function failed:", aiError);

        await supabase
          .from("submissions")
          .update({
            status: "submitted",
            ai_summary:
              "Video submitted successfully. AI processing is pending review.",
          })
          .eq("id", newSubmission.id);

        toast.success("Submission sent!", {
          description:
            "Your video was uploaded. AI processing will be reviewed separately.",
          id: toastId,
        });

        router.push("/test/success");
        return;
      }

      toast.success("Submission sent!", {
        description:
          "Your video response has been uploaded and is being reviewed.",
        id: toastId,
      });

      router.push("/test/success");

      router.push("/test/success");

      router.push("/test/success");
    } catch (err: unknown) {
      console.error("Critical Failure:", err);

      toast.error("Submission failed", {
        description:
          err instanceof Error ? err.message : "Something went wrong.",
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="min-h-[120px] rounded-xl border border-blue-100 bg-blue-50 p-5 shadow-sm flex flex-col justify-center">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-600">
            Step {currentStep + 1} of {questions.length}
          </span>
        </div>

        <p className="text-lg font-semibold leading-tight text-blue-900">
          {questions[currentStep]}
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          disabled={currentStep === 0}
          onClick={() => setCurrentStep((prev) => prev - 1)}
        >
          Previous
        </Button>

        <Button
          variant="outline"
          className="flex-1"
          disabled={currentStep === questions.length - 1}
          onClick={() => setCurrentStep((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>

      <hr className="border-slate-100" />

      <div className="space-y-2">
        <Label htmlFor="candidate_name">Your Name</Label>
        <Input
          id="candidate_name"
          type="text"
          placeholder="Jane Contractor"
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="candidate_email">Your Email Address</Label>
        <Input
          id="candidate_email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <p className="text-[10px] italic text-slate-400">
          We'll use this to contact you about the job.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-center text-[10px] font-bold uppercase text-slate-400">
          Record your walkthrough
        </p>

        <CandidateRecorder onUpload={handleUpload} />
      </div>
    </div>
  );
}
