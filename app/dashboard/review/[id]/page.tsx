import { createClient } from '@/lib/supabase'

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()

  // 1. Fetch the submission, joined with the assessment for keywords
  const { data: submission, error } = await supabase
    .from('submissions')
    .select(`
      *,
      assessments (
        title,
        required_keywords
      )
    `)
    .eq('id', id)
    .single()

  if (error || !submission) return <div className="p-20 text-center">Submission not found.</div>

  // 2. Generate the temporary video link
  const { data: signedUrl } = await supabase.storage
    .from('assessments')
    .createSignedUrl(submission.video_url, 3600)

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <a href="/dashboard" className="text-sm text-slate-500 hover:text-black">← Back to Dashboard</a>
        <div className="text-right">
          <h1 className="text-xl font-bold">{submission.assessments?.title}</h1>
          <p className="text-xs text-slate-400">ID: {id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Video & AI Summary */}
        <div className="space-y-6">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-xl border-4 border-slate-900">
            {signedUrl?.signedUrl ? (
              <video src={signedUrl.signedUrl} controls className="w-full h-full" />
            ) : (
              <div className="flex items-center justify-center h-full text-white italic">
                Loading video...
              </div>
            )}
          </div>

          <div className={`p-6 rounded-xl border-2 ${
            submission.status === 'passed' 
              ? 'bg-green-50 border-green-100' 
              : 'bg-amber-50 border-amber-100'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-bold text-lg">AI Project Manager Verdict</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                submission.status === 'passed' ? 'bg-green-600 text-white' : 'bg-amber-600 text-white'
              }`}>
                {submission.status || 'Processing'}
              </span>
            </div>
            <p className="text-slate-800 text-sm leading-relaxed">
              {submission.ai_summary || "AI is currently analyzing this walkthrough..."}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Technical Details */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-4">
              Raw Transcript
            </h3>
            <div className="max-h-[300px] overflow-y-auto pr-2">
              <p className="text-sm text-slate-600 leading-relaxed italic">
                "{submission.transcript || "Transcription pending..."}"
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-xl border">
            <h3 className="font-bold text-sm mb-4">Technical Keyword Match</h3>
            <div className="flex flex-wrap gap-2">
              {submission.assessments?.required_keywords?.map((keyword: string) => {
                const isMatched = submission.transcript?.toLowerCase().includes(keyword.toLowerCase());
                return (
                  <span key={keyword} className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    isMatched 
                      ? 'bg-green-100 border-green-200 text-green-700' 
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                    {keyword} {isMatched ? '✓' : '○'}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}