import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // 1. Parse the record coming from the DB Webhook
  const { record } = await req.json()

  // 2. Format the Slack Message
  const slackPayload = {
    text: `🚀 *New Pilot Application Received!*`,
    attachments: [
      {
        color: "#2563eb",
        fields: [
          { title: "Name", value: record.full_name, short: true },
          { title: "Company", value: record.company_name, short: true },
          { title: "Phone", value: record.phone_number, short: true },
          { title: "Monthly Volume", value: record.monthly_volume, short: true },
          { title: "Primary Trade", value: record.primary_trade, short: true }
        ],
        footer: "SiteVerdict.online Lead Engine"
      }
    ]
  }

  // 3. Send to Slack
  await fetch(Deno.env.get('SLACK_WEBHOOK_URL')!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slackPayload)
  })

  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
})