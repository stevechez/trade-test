import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { record } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Get Public URL for the AI to access
    const { data: { publicUrl } } = supabase.storage
      .from('audits')
      .getPublicUrl(record.name)

    // 2. Call OpenAI GPT-4o
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a California Building Code inspector. Return a technical audit in JSON format."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Audit this walkthrough." },
              { type: "image_url", image_url: { url: publicUrl } }
            ]
          }
        ],
        response_format: { type: "json_object" }
      })
    })

    // --- CRITICAL FIX: Properly await the JSON response ---
    const payload = await aiResponse.json()
    
    // 3. Log Token Usage for Cost Tracking
    const usage = payload.usage
    console.log(`--- AUDIT COST REPORT ---`)
    console.log(`Tokens: ${usage.total_tokens} | Cost: ~$${(usage.total_tokens * 0.000005).toFixed(4)}`)

    // 4. Parse the AI's Verdict
    const verdict = JSON.parse(payload.choices[0].message.content)

    // 5. Update Database
    const { error: dbError } = await supabase
      .from('verdicts')
      .update({ 
        technician_notes: verdict,
        status: 'COMPLETED',
        metadata: { 
          tokens: usage.total_tokens,
          processed_at: new Date().toISOString()
        }
      })
      .eq('video_path', record.name)

    if (dbError) throw dbError

    return new Response(JSON.stringify({ success: true }), { 
      headers: { 'Content-Type': 'application/json' } 
    })

  } catch (err) {
    console.error(`Error: ${err.message}`)
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' } 
    })
  }
})