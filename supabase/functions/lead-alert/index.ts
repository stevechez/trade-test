// supabase/functions/lead-alert/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const { record } = await req.json() // The new lead data

  // Send a high-priority alert to your inbox
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'System <alerts@siteverdict.online>',
      to: ['your-personal-email@gmail.com'], // Send to yourself
      subject: `🔥 New Pilot Lead: ${record.full_name}`,
      html: `
        <h3>New Lead Captured</h3>
        <p><strong>Name:</strong> ${record.full_name}</p>
        <p><strong>Email:</strong> ${record.email}</p>
        <p><strong>Agency:</strong> ${record.company}</p>
        <a href="https://app.siteverdict.online/dashboard">View Dashboard</a>
      `
    }),
  })

  return new Response(JSON.stringify({ sent: true }), { status: 200 })
})