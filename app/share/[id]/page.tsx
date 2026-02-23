"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Loader2, ShieldCheck } from 'lucide-react'
// If your VerdictReport component is in a different folder, adjust this path
import VerdictReport from '@/components/VerdictReport' 

export default function ContractorSharePage({ params }: { params: { id: string } }) {
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const encodedEmail = searchParams.get('ref')
  
  const supabase = createClient()

  useEffect(() => {
    async function fetchReport() {
      const { data, error } = await supabase
        .from('verdicts')
        .select('*')
        .eq('id', params.id)
        .single()

      if (!error) setReportData(data)
      setLoading(false)
    }
    fetchReport()
  }, [params.id])

  // Decode the contractor's name from the link for that "pro" feel
  let contractorName = "Partner"
  if (encodedEmail) {
    try {
      contractorName = atob(encodedEmail).split('@')[0]
    } catch (e) { console.error("Identity decode failed") }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  )

  if (!reportData) return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <ShieldCheck className="w-12 h-12 text-slate-300" />
      <p className="text-slate-500 font-medium">Audit report not found or link expired.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Personalized Alpha Banner */}
      <div className="bg-blue-600 py-3 px-6 text-white text-center shadow-md">
        <p className="text-xs font-bold uppercase tracking-widest">
          Welcome, {contractorName} • SiteVerdict Alpha Portal
        </p>
      </div>

      <main className="py-8">
        {/* Pass isPublicView=true to enable the toggles for the contractor */}
        <VerdictReport data={reportData} isPublicView={true} />
      </main>
      
      <footer className="py-12 text-center text-slate-400 text-[9px] font-bold uppercase tracking-widest border-t border-slate-100 mt-10">
        Dunn Strategic Consulting LLC • Santa Cruz County, CA
      </footer>
    </div>
  )
}