import "jsr:@supabase/functions-js/edge-runtime.d.ts"
// @ts-ignore: Deno standard modules are handled by Supabase Edge Runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.40.0"

Deno.serve(async (req) => {
  try {
    // 1. Initialize Supabase inside the handler
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Parse the incoming webhook record
    const { record } = await req.json()

    // 3. Fetch Assessment details (Questions + Keywords)
    const { data: assessment, error: assessError } = await supabase
      .from('assessments')
      .select('title, questions, required_keywords')
      .eq('id', record.assessment_id)
      .single()

    if (assessError || !assessment) throw new Error("Assessment not found")

    // 4. Download the video from Storage to send to Groq
    const { data: videoData, error: downloadError } = await supabase.storage
      .from('assessments')
      .download(record.video_url)

    if (downloadError || !videoData) throw new Error("Video download failed")

    // 5. Transcribe with Groq Whisper
    const formData = new FormData()
    formData.append('file', new File([videoData], "video.webm", { type: "video/webm" }))
    formData.append('model', 'whisper-large-v3')

    const groqTranscribe = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}` },
      body: formData
    })

    const transcriptionResult = await groqTranscribe.json()
    const transcript = transcriptionResult.text

    // 6. AI Analysis Prompt
    const gradingPrompt = `
      You are a Master Tradesman reviewing a video walkthrough for: ${assessment.title}.
      
      QUESTIONS CANDIDATE WAS ASKED:
      ${(assessment.questions || []).join('\n')}

      REQUIRED KEYWORDS:
      ${(assessment.required_keywords || []).join(', ')}

      CANDIDATE TRANSCRIPT:
      "${transcript}"

      TASK:
      1. Did they answer all questions?
      2. Did they use keywords correctly?
      3. Do they sound like they are observing reality or reading a script?
      Output JSON: {"status": "passed" | "needs_review", "summary": "brief verdict"}
    `

    // 7. Get AI Verdict from Groq Llama
    const chatCompletion = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [{ role: "user", content: gradingPrompt }],
        response_format: { type: "json_object" }
      })
    })

    const analysis = await chatCompletion.json()
    const verdict = JSON.parse(analysis.choices[0].message.content)

    // 8. Update the Submission in DB
    await supabase
      .from('submissions')
      .update({ 
        transcript: transcript,
        ai_summary: verdict.summary,
        status: verdict.status 
      })
      .eq('id', record.id)

    return new Response(JSON.stringify({ message: "Analysis Complete" }), {
      headers: { "Content-Type": "application/json" },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})