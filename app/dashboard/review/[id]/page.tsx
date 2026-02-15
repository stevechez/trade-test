import { createClient } from '@/lib/supabase' 
import ReviewClient from './ReviewClient'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch data with the "forgiving" optional join
  const { data: submission, error } = await supabase
    .from('submissions')
    .select(`
      *,
      assessments (
        title
      ),
      profiles (
        is_premium
      )
    `) 
    .eq('id', id)
    .single();

  // 2. DEBUG MODE: Show error on screen instead of 404
  if (error) {
    return (
      <div className="p-20 text-red-600 font-mono">
        <h1 className="text-xl font-bold">Supabase Error</h1>
        <p>Message: {error.message}</p>
        <p>Code: {error.code}</p>
        <p>ID Attempted: {id}</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="p-20 text-slate-600 font-mono">
        <h1 className="text-xl font-bold">Data Missing</h1>
        <p>The record for ID {id} was not found in the submissions table.</p>
        <p>Try refreshing your Dashboard and clicking the link again.</p>
      </div>
    );
  }

  // 3. If everything is fine, render the client component
  return <ReviewClient submission={submission} />;
}