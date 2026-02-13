import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Mux from 'https://esm.sh/@mux/mux-node'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const mux = new Mux({
    tokenId: Deno.env.get('MUX_TOKEN_ID'),
    tokenSecret: Deno.env.get('MUX_TOKEN_SECRET'),
  });

  try {
    const { record } = await req.json()
    console.log(`Processing submission: ${record.id}`)

    // 1. Get a Signed URL for Mux (Mux needs a way to download the file)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('assessments')
      .createSignedUrl(record.video_url, 3600)

    if (urlError || !signedUrlData) throw new Error("Could not create signed URL for Mux")

    // 2. Tell Mux to create an asset
    console.log("Creating Mux Asset...")
    const asset = await mux.video.assets.create({
      input: [{ url: signedUrlData.signedUrl }],
      playback_policy: ['public'],
    });

    const playbackId = asset.playback_ids?.[0].id
    console.log(`Mux Asset Created. Playback ID: ${playbackId}`)

    // 3. Update the Database (Crucial Step)
    const { error: dbUpdateError } = await supabase
      .from('submissions')
      .update({ 
        mux_playback_id: playbackId,
        status: 'processing' // Keep it in processing until AI finishes
      })
      .eq('id', record.id)

    if (dbUpdateError) throw new Error(`DB Update Failed: ${dbUpdateError.message}`)

    // ... (Proceed to Groq Transcription and AI Analysis) ...
    // Make sure your final update also preserves the mux_playback_id!
    
    return new Response(JSON.stringify({ success: true, playbackId }), { status: 200 })

// 1. After you get your 'transcript' from OpenAI/Deepgram:
const transcript = transcriptionResponse.text;

// 2. Immediately call the AI again for the Summary
const summaryResponse = await openai.chat.completions.create({
  model: "gpt-4o-mini", // Use a fast model for speed
  messages: [
    { role: "system", content: "You are an expert trade project manager. Summarize the following site walkthrough transcript into a concise professional verdict." },
    { role: "user", content: transcript }
  ]
});

const aiSummary = summaryResponse.choices[0].message.content;

// 3. Update Supabase with BOTH pieces of data
const { error } = await supabase
  .from('submissions')
  .update({ 
    transcript: transcript,
    ai_summary: aiSummary,
    status: 'completed'
  })
  .eq('id', submissionId);

  } catch (err) {
    console.error("EDGE FUNCTION ERROR:", err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }

  // After the ai_summary is saved to Supabase...
const emailResponse = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${DENO_ENV.RESEND_API_KEY}`,
  },
  body: JSON.stringify({
    from: 'AI Project Manager <system@yourdomain.com>',
    to: [submission.candidate_email],
    subject: `Verdict: ${assessment.title}`,
    html: `<strong>The AI has reviewed the walkthrough:</strong><p>${aiSummary}</p>`
  }),
});
})