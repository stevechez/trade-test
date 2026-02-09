import { createClient } from '@/lib/supabase'

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()

  // 1. Get the single submission record by ID and join the assessment title
  const { data: submission, error } = await supabase
    .from('submissions')
    .select(`
      *,
      assessments (
        title
      )
    `)
    .eq('id', id)
    .single() // This ensures we get one object, not an array

  if (error || !submission) return <div>Submission not found</div>

  // 2. Generate a temporary link to the video (expires in 1 hour)
  const { data: signedUrl } = await supabase.storage
    .from('assessments')
    .createSignedUrl(submission.video_url, 3600)

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <a href="/dashboard" className="text-sm text-slate-500 hover:text-black">← Back to List</a>
      </div>
      
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold">Video Assessment Review</h2>
          {/* Now displaying the specific assessment title */}
          <p className="text-slate-500">{submission.assessments?.title}</p>
        </div>
        <div className="text-right text-xs text-slate-400">
          ID: {id}
        </div>
      </div>
      
      <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900">
        {signedUrl?.signedUrl ? (
          <video src={signedUrl.signedUrl} controls className="w-full h-full" />
        ) : (
          <div className="flex items-center justify-center h-full text-white">Video link expired.</div>
        )}
      </div>

      // Inside app/dashboard/review/[id]/page.tsx

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* AI Transcript */}
  <div className="md:col-span-2 p-4 bg-white rounded-lg border shadow-sm">
    <h3 className="font-bold text-sm mb-4">AI Transcript</h3>
    <p className="text-slate-700 leading-relaxed text-sm">
      {submission.transcript || "Analyzing audio..."}
    </p>
  </div>

  {/* Keyword Checklist */}
  <div className="p-4 bg-slate-50 rounded-lg border shadow-sm">
    <h3 className="font-bold text-sm mb-4">Keyword Match</h3>
    <div className="space-y-2">
      {submission.assessments?.required_keywords?.map((keyword: string) => {
        const isMatched = submission.transcript?.toLowerCase().includes(keyword.toLowerCase());
        return (
          <div key={keyword} className="flex items-center gap-2 text-sm">
            {isMatched ? 
              <span className="text-green-600 font-bold">✓</span> : 
              <span className="text-slate-300">○</span>
            }
            <span className={isMatched ? "text-slate-900" : "text-slate-400 italic"}>
              {keyword}
            </span>
          </div>
        )
      })}
    </div>
  </div>
</div>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-4 bg-slate-50 rounded-lg border">
          <h3 className="font-semibold mb-2">Technical Transcript</h3>
          {/* Display the real transcript if it exists, otherwise show placeholder */}
          <p className="text-sm text-slate-600">
            {submission.transcript || "AI Transcription currently processing..."}
          </p>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg border">
          <h3 className="font-semibold mb-2">Reviewer Notes</h3>
          <textarea 
            className="w-full h-24 p-2 text-sm border rounded" 
            placeholder="Add internal notes about this candidate..."
          />
        </div>
      </div>
    </div>
  )
}