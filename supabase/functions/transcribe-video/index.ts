import { serve } from "std/http/server.ts"
import { createClient } from "supabase"

serve(async (req) => {
  try {
    const { record } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Get the assessment details to find the 'required_keywords'
    const { data: assessment } = await supabase
      .from('assessments')
      .select('required_keywords')
      .eq('id', record.assessment_id)
      .single()

    // 2. Perform Transcription (Same as before)
    const file = new File([videoData], "video.webm", { type: "video/webm" })
    const formData = new FormData()
    formData.append('file', file)
    formData.append('model', 'whisper-large-v3')

    const groqResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}` },
      body: formData
    })

    const result = await groqResponse.json()
    const transcript = result.text.toLowerCase()

    // 3. Simple Keyword Matcher
    // We check how many of your Pro Keywords appeared in their speech
    const keywords = assessment.required_keywords || []
    const matched = keywords.filter(k => transcript.includes(k.toLowerCase()))
    
    // 4. Update the DB with the transcript AND the match count
    await supabase
      .from('submissions')
      .update({ 
        transcript: transcript,
        status: matched.length >= (keywords.length / 2) ? 'passed' : 'needs_review'
      })
      .eq('id', record.id)

    // 1. Download the video
    const { data: videoData, error: downloadError } = await supabase.storage
      .from('assessments')
      .download(record.video_url)

    if (downloadError) throw downloadError

    // 2. Prepare for Groq
    // We convert the 'data' (Blob) into a 'File' so Groq accepts it
    const file = new File([videoData], "video.webm", { type: "video/webm" })
    const formData = new FormData()
    formData.append('file', file)
    formData.append('model', 'whisper-large-v3')

    // 3. Request to Groq
    const groqResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}` },
      body: formData
    })

    const result = await groqResponse.json()
    const transcript = result.text || "Transcription failed"

    // 4. Update the DB
    await supabase
      .from('submissions')
      .update({ transcript: transcript })
      .eq('id', record.id)

    return new Response(JSON.stringify({ success: true }), { 
      headers: { "Content-Type": "application/json" } 
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" } 
    })
  }
})