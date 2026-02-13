import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { submissionId, userEmail } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Fetch the data for the email
  const { data: submission } = await supabase
    .from('submissions')
    .select('*, assessments(title)')
    .eq('id', submissionId)
    .single()

  // Use Resend or a similar API to send the email
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`
    },
    body: JSON.stringify({
      from: 'TradeTest AI <reports@yourdomain.com>',
      to: [userEmail],
      subject: `Vetting Report: ${submission.assessments.title}`,
      html: `<strong>Verdict: ${submission.status}</strong><p>${submission.ai_summary}</p>`
    })
  })

  return new Response(JSON.stringify({ sent: true }), { status: 200 })
})