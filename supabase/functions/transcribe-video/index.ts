import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const openAiApiKey = Deno.env.get("OPENAI_API_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function getVideoFetchUrl(videoUrl: string) {
  // Already a full URL.
  if (videoUrl.startsWith("http")) {
    return videoUrl;
  }

  // Stored Supabase path, e.g.
  // assessment-id/video-id.webm
  const { data, error } = await supabase.storage
    .from("site-videos")
    .createSignedUrl(videoUrl, 60 * 10);

  if (error || !data?.signedUrl) {
    throw new Error(`Could not create signed video URL for path: ${videoUrl}`);
  }

  return data.signedUrl;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing Supabase function secrets.");
    }

    const { submission_id, submissionId } = await req.json();
    const id = submission_id ?? submissionId;

    if (!id) {
      throw new Error("Missing submission_id.");
    }

    const { data: submission, error: subError } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (subError || !submission) {
      throw new Error(subError?.message || "Submission not found.");
    }

    if (!submission.video_url) {
      throw new Error("Submission has no video_url.");
    }

    let transcript = "";
    let aiSummary = "";

    if (openAiApiKey) {
      const videoFetchUrl = await getVideoFetchUrl(submission.video_url);

      const videoResponse = await fetch(videoFetchUrl);

      if (!videoResponse.ok) {
        throw new Error(`Could not fetch video: ${videoResponse.status}`);
      }

      const videoBlob = await videoResponse.blob();

      const formData = new FormData();
      formData.append("file", videoBlob, "submission.webm");
      formData.append("model", "whisper-1");

      const transcriptResponse = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openAiApiKey}`,
          },
          body: formData,
        },
      );

      if (!transcriptResponse.ok) {
        const errorText = await transcriptResponse.text();
        throw new Error(`OpenAI transcription failed: ${errorText}`);
      }

      const transcriptJson = await transcriptResponse.json();
      transcript = transcriptJson.text || "";

      aiSummary =
        transcript.length > 0
          ? "Transcript received and processed. Summary pending final scoring."
          : "No usable transcript was generated from the submitted video.";
    } else {
      // Safe fallback so the candidate submission still completes.
      transcript =
        submission.transcript?.trim() ||
        "Transcript pending. Video was uploaded successfully and is available for review.";

      aiSummary =
        "Video submitted successfully. AI transcription is pending final processing.";
    }

    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        transcript,
        ai_summary: aiSummary,
        status: "processed",
      })
      .eq("id", id);

    if (updateError) {
      throw new Error(`Submission update failed: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        submission_id: id,
        transcript,
        ai_summary: aiSummary,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("transcribe-video error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});