"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import VerdictReport from '@/components/VerdictReport'
import { Loader2 } from 'lucide-react'

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

  // Decode identity for the personal touch
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

  if (!reportData) return <div className="p-20 text-center">Audit report not found.</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-blue-600 py-4 px-6 text-white text-center shadow-lg">
        <p className="text-sm font-bold uppercase tracking-widest animate-pulse">
          Welcome, {contractorName} • SiteVerdict Alpha Portal
        </p>
      </div>

      <div className="py-8">
        {/* FIX: We pass 'data' instead of 'auditId' */}
        <VerdictReport data={reportData} isPublicView={true} />
      </div>
      
      <footer className="py-10 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        Dunn Strategic Consulting • Authorized Access Only
      </footer>
    </div>
  )
}