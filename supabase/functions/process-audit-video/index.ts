import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// --- 1. Clean Cloudinary Helper ---
// This no longer needs to upload anything to Supabase storage, 
// as Cloudinary handles the frame extraction via the URL.
async function getCloudinaryFrameUrl(
  videoUrl: string, 
  timestamp: number
) {
  const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME');
  
  // Cloudinary URL transformation logic:
  // We take the filename and apply the 'so_' (start offset) transformation.
  // Note: This assumes you have pointed Cloudinary to your Supabase bucket 
  // or uploaded the video to Cloudinary.
  const watermark = `l_text:Arial_25_bold:DUNN%20STRATEGIC,co_rgb:FFFFFF,b_rgb:00000080,g_south_east,x_30,y_30,p_15`;
  const videoBase = videoUrl.split('/').pop(); 
  const frameUrl = `https://res.cloudinary.com/${cloudName}/video/upload/so_${timestamp},w_1000,c_limit/v1/${videoBase}.jpg`;

  return frameUrl;
}

serve(async (req) => {
  try {
    const { record } = await req.json();
    const auditId = record.id;
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 2. Get Public URL for OpenAI
    const { data: { publicUrl: videoPublicUrl } } = supabase.storage
      .from('audits')
      .getPublicUrl(record.name);

    // 3. Call OpenAI GPT-4o
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a California Building Code inspector. Return JSON with findings. For every violation, provide a 'timestamp' in seconds."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Audit this construction walkthrough video." },
              { type: "image_url", image_url: { url: videoPublicUrl } }
            ]
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const payload = await aiResponse.json();
    const aiVerdict = JSON.parse(payload.choices[0].message.content);
    const usage = payload.usage;

    // 4. Generate Evidence URLs (Cloudinary Path)
    const evidencePhotos: string[] = [];
    for (let i = 0; i < aiVerdict.findings.length; i++) {
      const finding = aiVerdict.findings[i];
      if (finding.status !== 'PASS') {
        const photoUrl = await getCloudinaryFrameUrl(
          videoPublicUrl, 
          finding.timestamp || 0
        );
        evidencePhotos.push(photoUrl);
        finding.evidence_url = photoUrl;
      }
    }

    // 5. Update Database Metadata
    const { error: dbError } = await supabase
      .from('verdicts')
      .update({ 
        technician_notes: aiVerdict,
        status: 'COMPLETED',
        metadata: { 
          tokens: usage.total_tokens,
          processed_at: new Date().toISOString(),
          evidence_photos: evidencePhotos,
          cost_estimate: (usage.total_tokens * 0.000005)
        }
      })
      .eq('id', auditId);

    if (dbError) throw dbError;

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error(`Error: ${err.message}`);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
})