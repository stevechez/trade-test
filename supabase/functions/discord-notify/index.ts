// supabase/functions/discord-notify/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const DISCORD_WEBHOOK_URL = Deno.env.get('DISCORD_WEBHOOK_URL')

serve(async (req) => {
  const { record } = await req.json()

  const message = {
    content: `🚀 **New Site Audit Started!**`,
    embeds: [{
      title: record.title,
      description: `A new technical audit has been initiated for **${record.candidate_email}**.`,
      color: 5814783, // SiteVerdict Blue
      fields: [
        { name: "Project ID", value: record.id, inline: true },
        { name: "Status", value: record.status, inline: true }
      ]
    }]
  }

  await fetch(DISCORD_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  })

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
})