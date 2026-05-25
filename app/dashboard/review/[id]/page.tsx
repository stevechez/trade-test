import { createClient } from "@/lib/supabase";
import ReviewClient from "./ReviewClient";

function extractSiteVideoPath(videoUrl: string) {
  if (!videoUrl) return null;

  // Full public Supabase URL:
  // https://.../storage/v1/object/public/site-videos/folder/file.webm
  const publicMarker = "/storage/v1/object/public/site-videos/";
  if (videoUrl.includes(publicMarker)) {
    return decodeURIComponent(videoUrl.split(publicMarker)[1]);
  }

  // Signed Supabase URL:
  // https://.../storage/v1/object/sign/site-videos/folder/file.webm?token=...
  const signedMarker = "/storage/v1/object/sign/site-videos/";
  if (videoUrl.includes(signedMarker)) {
    return decodeURIComponent(videoUrl.split(signedMarker)[1].split("?")[0]);
  }

  // Raw storage path:
  // folder/file.webm
  if (!videoUrl.startsWith("http")) {
    return videoUrl.replace(/^\/+/, "");
  }

  // Unknown external URL. Leave it alone.
  return null;
}

async function getPlayableVideoUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  videoUrl: string | null,
) {
  if (!videoUrl) return null;

  // If it is some non-Supabase external URL, let the browser try it.
  if (
    videoUrl.startsWith("http") &&
    !videoUrl.includes("/storage/v1/object/")
  ) {
    return videoUrl;
  }

  const storagePath = extractSiteVideoPath(videoUrl);

  if (!storagePath) {
    console.error("Could not extract storage path from video_url:", videoUrl);
    return null;
  }

  const { data, error } = await supabase.storage
    .from("site-videos")
    .createSignedUrl(storagePath, 60 * 60);

  if (error || !data?.signedUrl) {
    console.error("Could not create signed video URL:", {
      originalVideoUrl: videoUrl,
      extractedStoragePath: storagePath,
      error,
    });

    return null;
  }

  return data.signedUrl;
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: submission, error } = await supabase
    .from("submissions")
    .select(
      `
      id,
      assessment_id,
      candidate_name,
      candidate_email,
      video_url,
      transcript,
      ai_score,
      ai_summary,
      status,
      created_at,
      assessments (
        id,
        title,
        prompt_text,
        problem_image_url
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !submission) {
    return (
      <div className="p-20 font-mono text-red-600">
        <h1 className="text-xl font-bold">Database Error</h1>
        <p>{error?.message || "Submission not found"}</p>
        <p>ID: {id}</p>
      </div>
    );
  }

  const playableVideoUrl = await getPlayableVideoUrl(
    supabase,
    submission.video_url,
  );

  const normalizedSubmission = {
    ...submission,
    video_url: playableVideoUrl,
    assessments: Array.isArray(submission.assessments)
      ? (submission.assessments[0] ?? null)
      : submission.assessments,
  };

  return <ReviewClient submission={normalizedSubmission} />;
}
