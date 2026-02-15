// app/dashboard/DashboardClient.tsx
"use client"

import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns" // Optional: for cleaner dates
import { ArrowRight, Video, ClipboardCheck } from "lucide-react"

export default function DashboardClient({ initialSubmissions }: { initialSubmissions: any[] }) {
  return (
    <div className="max-w-7xl mx-auto p-8 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Project Command</h1>
          <p className="text-slate-500 mt-2 text-lg">Managing {initialSubmissions.length} trade verdicts across all sites.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Date</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Assessment</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Submission</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-center">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {initialSubmissions.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-5 text-sm text-slate-500 font-medium">
                  {new Date(sub.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <ClipboardCheck className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-slate-800">{sub.assessments?.title}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-slate-600 italic">
                  {sub.candidate_email}
                </td>
                <td className="px-6 py-5 text-center">
                  <Badge 
                    className="shadow-none rounded-full px-3"
                    variant={sub.status === 'completed' ? 'default' : 'secondary'}
                  >
                    {sub.status}
                  </Badge>
                </td>
                <td className="px-6 py-5 text-right">
                  <Link 
  href={`/dashboard/review/${sub.id}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-all group-hover:translate-x-1"
                  >
                    View Verdict <ArrowRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        
      </div>
      {/* ... existing dashboard content ... */}

<footer className="mt-20 border-t border-slate-100 py-10 no-print">
  <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500">
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
      <span>Systems Operational - Beta v1.0</span>
    </div>
    
    <div className="flex gap-8 font-medium">
      <Link href="/terms" className="hover:text-blue-600 transition-colors">
        Privacy & Terms
      </Link>
      <Link href="mailto:support@siteverdict.online" className="hover:text-blue-600 transition-colors">
        Support
      </Link>
      <span className="text-slate-300">© 2026 SiteVerdict</span>
    </div>
  </div>
</footer>
    </div>
  )
}