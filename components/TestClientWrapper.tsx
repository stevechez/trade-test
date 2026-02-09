"use client"

import CandidateRecorder from '@/components/CandidateRecorder'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation' // Added for the redirect

export default function TestClientWrapper({ assessment }: { assessment: any }) {
  const router = useRouter()

  // If for any reason assessment is missing, stop here
  if (!assessment) return null;

  const handleUpload = async (blob: Blob) => {
    const supabase = createClient()
    const fileName = `${assessment.id}/${crypto.randomUUID()}.webm`

    // 1. Upload the video file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('assessments')
      .upload(fileName, blob, { contentType: 'video/webm' })

    if (uploadError) {
      alert("Upload failed: " + uploadError.message)
      return
    }

    // 2. Save the submission record to the database
    const { error: dbError } = await supabase.from('submissions').insert({
      assessment_id: assessment.id,
      video_url: uploadData.path,
      status: 'completed'
    })

    if (dbError) {
      alert("Database error: " + dbError.message)
    } else {
      // 3. Success! Redirect to the clean success page
      router.push('/test/success')
    }
  }

  return (
    <div className="space-y-6">
      {/* Problem Image display */}
      <div className="w-full aspect-square bg-slate-100 rounded-xl overflow-hidden border">
        {assessment.problem_image_url ? (
          <img 
            src={assessment.problem_image_url} 
            alt="Problem to solve" 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            No image provided
          </div>
        )}
      </div>

      {/* Instruction Box */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-xs font-bold text-blue-900 mb-1">INSTRUCTIONS</h3>
        <p className="text-blue-800 text-sm">{assessment.prompt_text}</p>
      </div>

      {/* Video Recorder */}
      <CandidateRecorder onUpload={handleUpload} />
    </div>
  )
}