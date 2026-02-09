"use client"

import { useState } from 'react' // Added missing import
import CandidateRecorder from '@/components/CandidateRecorder'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button' // Added missing import
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export default function TestClientWrapper({ assessment }: { assessment: any }) {
  const router = useRouter()
  const [email, setEmail] = useState('')

  // 1. Hooks MUST be at the top
  const [currentStep, setCurrentStep] = useState(0)
  
  // Safety check for assessment data
  if (!assessment) return null;

  // Use the new questions array, or fallback to the single prompt_text
  const questions = assessment.questions && assessment.questions.length > 0 
    ? assessment.questions 
    : [assessment.prompt_text]

  const handleUpload = async (blob: Blob) => {
  // 1. Validation: Don't let them submit without an email
  if (!email || !email.includes('@')) {
    alert("Please enter a valid email address before submitting.");
    return;
  }

  const supabase = createClient()
  const fileName = `${assessment.id}/${crypto.randomUUID()}.webm`

  // 2. Upload with explicit error check
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('assessments')
    .upload(fileName, blob, { contentType: 'video/webm' })

  if (uploadError || !uploadData) {
    console.error("Upload Error:", uploadError);
    alert("Upload failed: " + (uploadError?.message || "Unknown error"));
    return; // Stop here if upload failed
  }

  // 3. Database insert using the verified uploadData
  const { error: dbError } = await supabase.from('submissions').insert({
    assessment_id: assessment.id,
    video_url: uploadData.path,
    candidate_email: email,
    status: 'completed'
  })

  if (dbError) {
    console.error("DB Error:", dbError);
    alert("Database error: " + dbError.message);
  } else {
    router.push('/test/success');
  }
}

  return (
    <div className="space-y-6">
      {/* 2. The Question Carousel */}
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

      {/* 3. Navigation Controls */}
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

      {/* 4. The Video Recorder */}
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