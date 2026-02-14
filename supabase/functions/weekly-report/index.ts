// supabase/functions/weekly-report/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. Calculate the "Last 7 Days" range
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  // 2. Fetch new submissions and leads
  const { data: subs } = await supabase
    .from('submissions')
    .select('id, assessments(title)')
    .gte('created_at', oneWeekAgo.toISOString())

  const { data: leads } = await supabase
    .from('leads')
    .select('id')
    .gte('created_at', oneWeekAgo.toISOString())

  // 3. Send the Executive Summary via Resend
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    },
    body: JSON.stringify({
      from: 'Analytics <reports@siteverdict.online>',
      to: ['your-personal-email@gmail.com'],
      subject: `📈 Weekly Performance: SiteVerdict.online`,
      html: `
        <h2>Weekly Success Report</h2>
        <p><strong>New Walkthroughs:</strong> ${subs?.length || 0}</p>
        <p><strong>New Realtor Leads:</strong> ${leads?.length || 0}</p>
        <hr />
        <p>Keep the momentum going in Santa Cruz County!</p>
      `
    }),
  })

  return new Response("Report Sent", { status: 200 })
})