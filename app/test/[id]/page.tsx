import { createClient } from '@/lib/supabase'
import TestClientWrapper from '@/components/TestClientWrapper'

export default async function TestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()

  const { data: assessment, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', id)
    .single()

  // SAFETY CHECK: If the ID in the URL doesn't exist in your SQL table
  if (error || !assessment) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-red-600 font-bold">Assessment Not Found</h1>
        <p className="text-sm text-slate-500">The ID in the URL doesn't match any records in your Supabase 'assessments' table.</p>
        <p className="mt-4 text-xs font-mono bg-slate-100 p-2 inline-block">Attempted ID: {id}</p>
      </div>
    )
  }

  return (
    <main className="max-w-md mx-auto min-h-screen p-4 flex flex-col gap-6 pt-12">
      <h1 className="text-2xl font-bold text-center">{assessment.title}</h1>
      <TestClientWrapper assessment={assessment} />
    </main>
  )
}