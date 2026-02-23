import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // 1. Slack sends data as URL-encoded 'payload'
  const formData = await req.formData()
  const payload = JSON.parse(formData.get('payload') as string)
  
  // Extract our data from the button value
  const { auditId, itemIndex } = JSON.parse(payload.actions[0].value)
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 2. Fetch the original audit data to get the video/image URL
  const { data: audit } = await supabase
    .from('verdicts')
    .select('*')
    .eq('id', auditId)
    .single()

  const finding = audit.technician_notes.findings[itemIndex]

  // 3. Call OpenAI for a targeted "Re-Inspection"
try {
  const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a building inspector verifying a fix. Review the image and confirm if the previous violation is resolved."
        },
        {
          role: "user",
          content: [
            { type: "text", text: `The contractor claims they fixed: ${finding.item}. Previous fix required: ${finding.fix}. Is it resolved now? Return JSON: { "resolved": boolean, "reason": "string" }` },
            { type: "image_url", image_url: { url: audit.video_path } } // Assuming path is public URL
          ]
        }
      ],
      response_format: { type: "json_object" }
    })
  })

  if (!aiResponse.ok) {
    const errorData = await aiResponse.json()
    throw new Error(`OpenAI API Error: ${errorData.error.message}`)
  }
} catch (error) {
  // Alert Slack that the AI is down or the Key is invalid
  await fetch(Deno.env.get('SLACK_WEBHOOK_URL')!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 *Critical: OpenAI Integration Failure*`,
      attachments: [{
        color: "#ff0000",
        text: `Error: ${error.message}\nAction: Check API Key or Credits at platform.openai.com`
      }]
    })
  })
  return new Response("Error handled", { status: 500 })
}

  if (verdict.resolved) {
  // Update the database to reflect the verified status
  const updatedFindings = [...audit.technician_notes.findings]
  updatedFindings[itemIndex].status = 'PASS' // Change FAIL to PASS

  const { error: updateError } = await supabase
    .from('verdicts')
    .update({ 
      status: 'VERIFIED',
      technician_notes: {
        ...audit.technician_notes,
        findings: updatedFindings
      },
      metadata: {
        ...audit.metadata,
        ai_verified_at: new Date().toISOString()
      }
    })
    .eq('id', auditId)

  if (updateError) console.error("Database update failed:", updateError)
}

  const result = await aiResponse.json()
  const verdict = JSON.parse(result.choices[0].message.content)

  // 4. Send the result back to Slack as a reply
  await fetch(payload.response_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: verdict.resolved 
        ? `✅ *AI Verified:* ${finding.item} is now compliant!\n> ${verdict.reason}`
        : `❌ *AI Denied:* ${finding.item} still shows issues.\n> ${verdict.reason}`,
      replace_original: false
    })
  })

  return new Response(null, { status: 200 })
})