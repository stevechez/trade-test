// 1. Fetch the full assessment data including the new questions array
const { data: assessment } = await supabase
  .from('assessments')
  .select('questions, required_keywords')
  .eq('id', record.assessment_id)
  .single()

// ... (Transcription logic remains the same) ...

const transcript = result.text; // The full text from the video

// 2. Updated AI Grading Prompt
const gradingPrompt = `
  You are a Master Tradesman reviewing a 10-step video walkthrough for a ${assessment.title} task.
  
  QUESTIONS TO ANSWER:
  ${assessment.questions.join('\n')}

  REQUIRED TECHNICAL KEYWORDS:
  ${assessment.required_keywords.join(', ')}

  CANDIDATE TRANSCRIPT:
  "${transcript}"

  YOUR TASK:
  1. Determine if the candidate addressed each of the ${assessment.questions.length} questions.
  2. Check for the presence of the technical keywords in the correct context.
  3. Identify if the candidate sounds like they are reading a script vs. observing real-world conditions.
  4. Output a JSON status: {"status": "passed" | "needs_review", "score": 0-100, "summary": "brief verdict"}
`;

// 3. Send to Groq for analysis
const chatCompletion = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
    'Content-Type': 'application/json' 
  },
  body: JSON.stringify({
    model: "llama-3.1-70b-versatile",
    messages: [{ role: "user", content: gradingPrompt }],
    response_format: { type: "json_object" }
  })
})

const analysis = await chatCompletion.json();
const verdict = JSON.parse(analysis.choices[0].message.content);

// 4. Update the Submission record
await supabase
  .from('submissions')
  .update({ 
    transcript: transcript,
    ai_summary: verdict.summary,
    status: verdict.status 
  })
  .eq('id', record.id)