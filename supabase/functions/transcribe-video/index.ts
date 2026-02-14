import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Generates a tailored prompt based on user tier
 */
export async function getAuditPrompt(isPremium: boolean, transcript: string) {
  const baseInstructions = `Analyze this trade walkthrough transcript: ${transcript}.`
  
  if (isPremium) {
    // High-performance deep-dive for Premium members
    return `${baseInstructions} 
    Provide a "Deep-Dive Audit" including:
    1. Technical Specifications (Model, Capacity, Estimated Age).
    2. Code Compliance & Safety (T&P valves, venting, seismic strapping).
    3. Maintenance Verdict: What is the immediate 'next step' for a Realtor?
    4. Long-term Outlook: When will this unit likely fail?
    Format as a professional Project Manager report.`
  }

  // Standard "Professional Verdict"
  return `${baseInstructions} Provide a concise 2-3 sentence "Professional Verdict" on the unit's condition and immediate safety concerns.`
}

serve(async (req) => {
  try {
    const { submission_id } = await req.json()

    // 1. Fetch the submission data
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submission_id)
      .single()

    if (subError || !submission) throw new Error("Submission not found")

    // 2. Fetch the user's profile status for Premium check
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('email', submission.candidate_email)
      .single();

    const isPremium = profile?.is_premium ?? false;

    // 3. Logic for Mux/OpenAI processing (Assuming fullTranscript is generated here)
    const fullTranscript = submission.transcript || "No transcript available."; 

    // 4. Generate the dynamic prompt based on Tier
    const systemPrompt = await getAuditPrompt(isPremium, fullTranscript);

    // 5. Call OpenAI and update the record
    // (Existing OpenAI fetch logic goes here, using systemPrompt)
    
    return new Response(JSON.stringify({ success: true, premium: isPremium }), { 
      headers: { "Content-Type": "application/json" } 
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})