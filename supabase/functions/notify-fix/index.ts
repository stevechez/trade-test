import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    // FIX: Added 'recipient' to the destructured object
    const { auditId, item, isFixed, address, signedOffAt, idx, evidenceUrl, recipient } = await req.json()

    const formattedTime = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(signedOffAt || Date.now()))

    // --- RESEND EMAIL LOGIC ---
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (RESEND_API_KEY) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'SiteVerdict <reports@siteverdict.online>',
          to: [recipient || 'stevechez@gmail.com'],
          subject: `Action Required: Technical Audit for ${address || 'your property'}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
              <h2 style="color: #1e293b; margin-top: 0;">SiteVerdict Audit Update</h2>
              <p style="color: #64748b;">A correction has been logged for <strong>${address || 'the property'}</strong>.</p>
              <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold; color: #1e293b;">Item: ${item || 'General Audit Item'}</p>
                <p style="margin: 4px 0 0 0; color: #2563eb;">Status: ${isFixed ? 'RESOLVED' : 'OPEN - ACTION REQUIRED'}</p>
              </div>
              <a href="https://report.siteverdict.online/share/${auditId}" 
                 style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                 View Full Report & Evidence
              </a>
              <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
                © 2026 Dunn Strategic Consulting, LLC • Santa Cruz, CA
              </p>
            </div>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        console.error("Resend Error Detail:", errorData);
      }
    }

    // --- SLACK LOGIC ---
    const slackPayload = {
      text: isFixed ? `✅ *Correction Resolved at ${address}*` : `⚠️ *Correction Re-opened at ${address}*`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Item:* ${item}\n*Status:* ${isFixed ? 'Resolved' : 'Re-opened'}\n*Time:* ${formattedTime}`
          }
        },
        ...(evidenceUrl ? [{
          type: "image",
          title: { type: "plain_text", text: "Visual Evidence (Dunn Strategic Verified)" },
          image_url: evidenceUrl,
          alt_text: "Audit Evidence"
        }] : []),
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "View Full Report" },
              url: `https://report.siteverdict.online/share/${auditId}`,
              action_id: "view_report"
            }
          ]
        },
        {
          type: "context",
          elements: [{ type: "mrkdwn", text: "SiteVerdict • Dunn Strategic Consulting LLC" }]
        }
      ]
    }

    const webhookUrl = Deno.env.get('SLACK_WEBHOOK_URL')
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackPayload),
      })
    }

    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    })
    
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400 
    })
  }
})