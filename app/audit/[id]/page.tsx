"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase"
import VerdictReport from "@/components/VerdictReport"
import VerdictSkeleton from "@/components/VerdictSkeleton"

export default function AuditPage() {
  const { id } = useParams()
  const [auditData, setAuditData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAudit() {
      try {
        setLoading(true)
        const supabase = createClient()

        // Fetch the specific audit by ID
        const { data, error: sbError } = await supabase
          .from('verdicts')
          .select('*')
          .eq('id', id)
          .single()

        if (sbError) throw sbError
        if (!data) throw new Error("Audit not found")

        setAuditData(data)
      } catch (err: any) {
        console.error("Fetch Error:", err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchAudit()
  }, [id])

  // 1. Show the Skeleton while loading
  if (loading) return <VerdictSkeleton />

  // 2. Handle Errors (e.g., if a GC enters a bad URL)
  if (error || !auditData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Audit Not Found</h2>
        <p className="text-slate-500 mb-6">The link you followed may be broken or the audit has been removed.</p>
        <a href="/dashboard" className="text-blue-600 font-bold hover:underline">Return to Dashboard</a>
      </div>
    )
  }

  // 3. Render the full Report
  // Pass 'isPublicView' based on your logic (e.g., if no user is logged in)
  return <VerdictReport data={auditData} isPublicView={true} />
}