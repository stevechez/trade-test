import { createClient } from '@/lib/supabase' 
import ReviewClient from './ReviewClient'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch the data on the server
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

  // 2. Handle missing records or database errors
  if (error || !submission) {
    console.error("Database Error:", error?.message || "Submission not found in DB");
    return notFound();
  }

  // 3. Pass the data to the Client Component
  // The alerts and debug logic must live inside ReviewClient.tsx, not here!
  return <ReviewClient submission={submission} />;
}