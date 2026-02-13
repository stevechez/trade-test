import { createClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import TestClientWrapper from '@/components/TestClientWrapper' // Ensure this path is correct

// 1. Next.js 15 Fix: params is now a Promise
export default async function CandidatePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 2. Await the params to get the actual ID string
  const { id } = await params;
  const supabase = createClient()
  
  // 3. Fetch full assessment data, including questions
  const { data: assessment } = await supabase
    .from('assessments')
    .select('*') // Get all fields including questions and prompt_text
    .eq('id', id)
    .single()

  // 4. If ID is wrong or doesn't exist, trigger 404
  if (!assessment) return notFound()

  // 5. THE "PAUSED" VIEW (Handling inactive projects)
  if (!assessment.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full border-amber-200 bg-amber-50">
          <CardHeader className="text-center">
            <div className="mx-auto bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="text-amber-600 h-6 w-6" />
            </div>
            <CardTitle className="text-xl text-amber-900">Assessment Paused</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-amber-800">
              The assessment for <strong>{assessment.title}</strong> is currently not accepting new submissions.
            </p>
            <p className="text-sm text-amber-700">
              If you believe this is an error, please contact the project manager directly.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 6. THE ACTIVE RECORDING VIEW (Live integration)
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto py-12 px-6">
        <header className="mb-10">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {assessment.title}
          </h1>
          <p className="text-slate-500">
            Follow the prompts below to record your technical walkthrough.
          </p>
        </header>

        {/* This connects to the recorder logic we just fixed */}
        <TestClientWrapper assessment={assessment} />
      </div>
    </div>
  )
}