import { createClient } from '@/lib/supabase' 
import ReviewClient from './ReviewClient'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch data with an OPTIONAL join to profiles
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
    `) // Removed the strict !submissions_candidate_email_fkey join
    .eq('id', id)
    .single();

  // 2. Debugging: If this triggers a 404, check your terminal/Vercel logs
  if (error || !submission) {
    if (error) console.error("Supabase Query Error:", error.message);
    return notFound();
  }

  return <ReviewClient submission={submission} />;
}