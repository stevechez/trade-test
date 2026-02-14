"use client"

import { useState } from 'react'
import CandidateRecorder from '@/components/CandidateRecorder'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function TestClientWrapper({ assessment }: { assessment: any }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const supabase = createClient()

  if (!assessment) return null;

  const questions = assessment.questions && assessment.questions.length > 0 
    ? assessment.questions 
    : [assessment.prompt_text]

  // 1. Logic to wake up the AI Edge Function
  const processVideo = async (submissionId: string) => {
    console.log("Waking up AI for submission:", submissionId)
    try {
      // Stringifying the body ensures valid JSON input for the function
      const { data, error } = await supabase.functions.invoke('transcribe-video', {
        body: JSON.stringify({ submissionId })
      })
      if (error) throw error
      return true
    } catch (err) {
      console.error("Supabase Function Error:", err)
      return false
    }
  }
// Inside TestClientWrapper...

const handleUpload = async (blob: Blob) => {
  if (!email || !email.includes('@')) {
    toast.error("Please enter a valid email address.");
    return;
  }

  const toastId = toast.loading("Saving your walkthrough...")
  const fileName = `${assessment.id}/${crypto.randomUUID()}.webm`

  try {
    // 1. Upload to Storage FIRST
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('assessments')
      .upload(fileName, blob, { contentType: 'video/webm' })

    if (uploadError) throw new Error("Storage failure: " + uploadError.message);

    // 2. Insert and AWAIT the confirmation
    const { data: newSubmission, error: dbError } = await supabase
      .from('submissions')
      .insert({
        assessment_id: assessment.id,
        video_url: uploadData.path,
        candidate_email: email,
        status: 'processing'
      })
      .select()
      .single();

    if (dbError || !newSubmission) throw new Error("Database sync failed.");

    // 3. Trigger AI with a guaranteed valid JSON body
    toast.loading("AI is now analyzing your video...", { id: toastId });
    
    const { data: aiResponse, error: aiError } = await supabase.functions.invoke('transcribe-video', {
      body: { submissionId: newSubmission.id } // The SDK handles the JSON.stringify for you
    });

    if (aiError) throw aiError;

    toast.success("Analysis complete!", { id: toastId });
    router.push('/test/success');

  } catch (err: any) {
    console.error("Critical Failure:", err);
    toast.error(`Error: ${err.message}`, { id: toastId });
  }
}

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm min-h-[120px] flex flex-col justify-center">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-100 px-2 py-0.5 rounded">
            Step {currentStep + 1} of {questions.length}
          </span>
        </div>
        <p className="text-blue-900 font-semibold text-lg leading-tight">
          {questions[currentStep]}
        </p>
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1"
          disabled={currentStep === 0} 
          onClick={() => setCurrentStep(prev => prev - 1)}
        >
          Previous
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          disabled={currentStep === questions.length - 1} 
          onClick={() => setCurrentStep(prev => prev + 1)}
        >
          Next
        </Button>
      </div>

      <hr className="border-slate-100" />

      <div className="space-y-2">
        <p className="text-[10px] text-center text-slate-400 font-bold uppercase">Record your walkthrough</p>
        <CandidateRecorder onUpload={handleUpload} />
      </div>

      <div className="space-y-2 mb-6">
        <Label htmlFor="candidate_email">Your Email Address</Label>
        <Input 
          id="candidate_email"
          type="email" 
          placeholder="name@example.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <p className="text-[10px] text-slate-400 italic">We'll use this to contact you about the job.</p>
      </div>
    </div>
  )
}