import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { submissionId, userEmail } = await req.json()
    console.log(`Payload Received: ID=${submissionId}, Email=${userEmail}`)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Inside your Edge Function, after the successful Resend response:
const { error: updateError } = await supabase
  .from('submissions')
  .update({ 
    status: 'completed',
    // Optionally: sent_at: new Date().toISOString() 
  })
  .eq('id', submissionId);

if (updateError) console.error("Database Update Error:", updateError);
    if (fetchError || !submission) {
      console.error("Supabase Fetch Error:", fetchError)
      throw new Error('Submission not found')
    }

    // Attempting the send
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`
      },
      body: JSON.stringify({
        from: 'SiteVerdict <verdicts@siteverdict.online>',
        to: [userEmail],
        subject: `Site Audit Verdict: ${submission.assessments?.title || 'Residential Project'}`,
        html: `<h1>Technical Audit Ready</h1><p>View at siteverdict.online/dashboard/review/${submission.id}</p>`
      })
    })

    const resData = await res.json()
    
    // THE CATCH-ALL LOG: This prints the exact error from Resend
    console.log("Resend API Response:", JSON.stringify(resData, null, 2))

    if (!res.ok) {
      throw new Error(`Resend Error: ${resData.message || 'Unknown Resend Error'}`)
    }

    return new Response(JSON.stringify(resData), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    console.error("Function Crash Log:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})