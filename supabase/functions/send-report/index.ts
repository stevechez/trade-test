import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { submissionId, userEmail } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 2. Fetch the data for the email
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('*, assessments(title)')
      .eq('id', submissionId)
      .single()

    if (fetchError || !submission) {
      throw new Error('Submission not found')
    }

    // 3. Send via Resend using the SiteVerdict verified domain
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
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #1e293b; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 20px; letter-spacing: 1px;">SITEVERDICT.ONLINE</h1>
            </div>
            <div style="padding: 30px;">
              <h2 style="color: #0f172a; margin-top: 0;">Technical Audit Ready</h2>
              <p style="color: #475569; line-height: 1.6;">A new technical audit has been completed for <strong>${submission.assessments?.title || 'the requested site'}</strong>.</p>
              
              <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px; text-transform: uppercase;">AI Analysis Verdict</h3>
                <p style="margin: 0; color: #334155; font-style: italic;">"${submission.ai_summary || 'Analysis complete. Please see the full report for details.'}"</p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="/Projects/trade-test/app/dashboard/review/[id]" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  View Full Technical Report
                </a>
              </div>
            </div>
            <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
              Sent via SiteVerdict AI Compliance Engine.
            </div>
          </div>
        `
      })
    })

    const resData = await res.json()

    return new Response(JSON.stringify(resData), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})