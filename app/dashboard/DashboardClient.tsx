"use client"

import { useState } from 'react' // New Import
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // Assumes you have Shadcn Input
import { 
  ArrowRight, 
  FileText, 
  Search, 
  X,
  ShieldCheck 
} from "lucide-react"

export default function DashboardClient({ initialSubmissions }: { initialSubmissions: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter logic for searching by Title or Email
  const filteredSubmissions = initialSubmissions.filter(sub => {
    const title = sub.assessments?.title?.toLowerCase() || "";
    const email = sub.candidate_email?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return title.includes(search) || email.includes(search);
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in slide-in-from-bottom-2 duration-500">
      {/* Header & Search Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">Project Command</h1>
          <p className="text-slate-500 mt-2 text-lg">
            Managing {initialSubmissions.length} trade verdicts.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <Input 
            placeholder="Search property or trade..." 
            className="pl-10 pr-10 py-6 rounded-2xl border-slate-200 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Results Count (Only shows when searching) */}
      {searchTerm && (
        <p className="mb-4 text-xs font-bold text-blue-600 uppercase tracking-widest">
          Showing {filteredSubmissions.length} results for "{searchTerm}"
        </p>
      )}

      {/* Responsive Card Stack */}
      <div className="w-full space-y-4">
        {filteredSubmissions.map((sub) => (
          <div 
            key={sub.id} 
            className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-200 transition-colors group"
          >
            {/* ... (Keep the rest of your card logic from previous step) ... */}
            <div className="flex items-center gap-4 md:w-1/4">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logged</p>
                <p className="text-sm font-bold text-slate-900">
                  {new Date(sub.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assessment</p>
              <h4 className="text-lg font-black text-slate-900 leading-tight">
                {sub.assessments?.title || 'General Compliance Audit'}
              </h4>
              <p className="text-slate-500 text-sm mt-1">{sub.candidate_email}</p>
            </div>

            <div className="md:w-1/5 flex justify-end">
              <Button asChild className="w-full md:w-auto bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold px-6">
                <Link href={`/dashboard/review/${sub.id}`} className="flex items-center gap-2">
                  View Verdict <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ))}

        {/* Empty State for No Search Results */}
        {filteredSubmissions.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No matches found for your search.</p>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <footer className="mt-20 border-t border-slate-100 py-10 no-print">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-medium">Systems Operational • Santa Cruz Beta v1.0</span>
          </div>
          
          <div className="flex gap-8 font-bold">
            <Link href="/terms" className="hover:text-blue-600 transition-colors">Privacy & Terms</Link>
            <Link href="mailto:support@siteverdict.online" className="hover:text-blue-600 transition-colors">Support</Link>
            <span className="text-slate-300 font-normal">© 2026 SiteVerdict</span>
          </div>
        </div>
      </footer>

    </div>
  )
}