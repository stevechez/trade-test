// app/review/[id]/page.tsx
import { createClient } from '@/lib/supabase' // Ensure this path is correct for your project
import ReviewClient from './ReviewClient'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

 // app/review/[id]/page.tsx

// 1. Destructure BOTH data and error from the query
const { data: submission, error } = await supabase
  .from('submissions')
  .select(`
    *,
    assessments (
      title
    ),
    profiles!submissions_candidate_email_fkey (
      is_premium
    )
  `) // Added explicit join for the profiles table
  .eq('id', id)
  .single();

// 2. Now 'error' is defined and can be checked
if (error || !submission) {
  console.error("Database Error:", error); // Debugging help
  return notFound();
}

  return <ReviewClient submission={submission} />;
}