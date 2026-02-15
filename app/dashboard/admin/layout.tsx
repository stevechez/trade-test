import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Guard: Only your specific email can enter this directory
  if (user?.email !== 'stevemac@example.com') { 
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 no-print">
        <div className="font-bold text-xl tracking-tight text-blue-600">Admin Console</div>
        <nav className="flex flex-col gap-4">
          <Link href="/dashboard/admin/feedback" className="text-sm font-medium hover:text-blue-600 transition-colors">
            User Feedback
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-slate-900 mt-auto">
            ← Back to Dashboard
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}