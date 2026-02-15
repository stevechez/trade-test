import { createClient } from '@/lib/supabase' 
import ReviewClient from './ReviewClient'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch only the submission and assessment (removing the profiles join)
  const { data: submission, error } = await supabase
    .from('submissions')
    .select(`
      *,
      assessments (
        title
      )
    `) 
    .eq('id', id)
    .single();

  if (error || !submission) {
    return (
      <div className="p-20 text-red-600 font-mono">
        <h1 className="text-xl font-bold">Database Error</h1>
        <p>{error?.message || "Submission not found"}</p>
        <p>ID: {id}</p>
      </div>
    );
  }

  return <ReviewClient submission={submission} />;
}