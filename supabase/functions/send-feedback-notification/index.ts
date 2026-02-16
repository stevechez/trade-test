import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const { record } = await req.json()

  // Build a "World-Class" email notification
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'SiteVerdict AI <notifications@siteverdict.online>',
      to: 'stevechez@gmail.com', // Your primary email
      subject: `New Beta Feedback: ${record.rating} Stars from ${record.user_email}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #2563eb;">New Pilot Insight Captured</h2>
          <p><strong>User:</strong> ${record.user_email}</p>
          <p><strong>Rating:</strong> ${'⭐'.repeat(record.rating)}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p><strong>Most Useful Part:</strong></p>
          <blockquote style="background: #f8fafc; padding: 15px; border-left: 4px solid #2563eb;">
            ${record.useful_part}
          </blockquote>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 30px;">
            Sent from SiteVerdict.online AAA Automation
          </p>
        </div>
      `,
    }),
  })

  return new Response(JSON.stringify({ done: true }), { 
    headers: { 'Content-Type': 'application/json' } 
  })
})