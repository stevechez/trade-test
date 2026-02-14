// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch all submissions ordered by newest first
  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('*, assessments(title)')
    .order('created_at', { ascending: false });

  if (error) return <div className="p-10 text-red-500 font-medium">Failed to load dashboard data.</div>;

  return <DashboardClient initialSubmissions={submissions || []} />;
}