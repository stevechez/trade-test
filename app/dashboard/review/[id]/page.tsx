'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase' 
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Button } from "@/components/ui/button"
import { Mail, Download, Loader2 } from "lucide-react"
import { toast } from 'sonner'

export default function ReviewPage() {
  const { id } = useParams()
  const [submission, setSubmission] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchSubmission() {
      setLoading(true)
      console.log("CRITICAL DEBUG: Fetching for ID:", id)

      // 1. First attempt: Search by Submission ID
      const res1 = await supabase
        .from('submissions')
        .select('*, assessments(*)')
        .eq('id', id)
        .maybeSingle()

      if (res1.data) {
        console.log("FOUND DATA via Primary ID")
        setSubmission(res1.data)
        setLoading(false)
        return
      }

      // 2. Second attempt: Search by Assessment ID (Fallback)
      console.log("Not found by Primary ID, trying assessment_id fallback...")
      const res2 = await supabase
        .from('submissions')
        .select('*, assessments(*)')
        .eq('assessment_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (res2.data) {
        console.log("FOUND DATA via Assessment ID")
        setSubmission(res2.data)
      } else {
        console.error("STILL NOTHING. Both attempts failed.")
      }

      setLoading(false)
    }

    if (id) fetchSubmission()
  }, [id, supabase])

  // Guard Clauses
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-4">
        <p className="text-slate-600 italic">Submission not found for ID: {id}</p>
        <Button onClick={() => window.location.href = '/dashboard'}>Return to Dashboard</Button>
      </div>
    )
  }

  const generatePDF = () => {
    const doc = new jsPDF()
    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(24)
    doc.text("TradeTest AI", 14, 25)
    doc.setFontSize(10)
    doc.text("Property Vetting & Technical Analysis", 14, 32)

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(18)
    doc.text(`Project: ${submission.assessments?.title || 'Unknown Project'}`, 14, 55)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Report ID: ${submission.id}`, 14, 62)
    doc.text(`Candidate: ${submission.candidate_email}`, 14, 72)

    const isPassed = submission.status === 'passed'
    doc.setFontSize(12)
    doc.setTextColor(isPassed ? 34 : 180, isPassed ? 197 : 83, isPassed ? 94 : 9)
    doc.text(`VERDICT: ${submission.status?.toUpperCase()}`, 14, 82)

    autoTable(doc, {
      startY: 90,
      head: [['Assessment Criteria', 'Result']],
      body: [
        ['AI Summary', submission.ai_summary || "Pending..."],
        ['Transcript Keywords', submission.assessments?.required_keywords?.join(', ') || 'None']
      ],
      headStyles: { fillColor: [15, 23, 42] }
    })

    doc.save(`TradeTest_Report_${submission.id}.pdf`)
  }

  const sendEmailReport = async (subId: string) => {
    const toastId = toast.loading("Sending report...")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: subId, userEmail: 'stevechez@gmail.com' })
      })
      if (res.ok) toast.success("Sent!", { id: toastId })
      else toast.error("Failed.", { id: toastId })
    } catch (error) {
      toast.error("Error.", { id: toastId })
    }
  }

  const reprocessSummary = async () => {
  const toastId = toast.loading("Waking up AI Project Manager...")
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-assessment`, {
      method: 'POST',
      body: JSON.stringify({ submissionId: submission.id })
    })
    if (res.ok) {
      toast.success("Analysis started! Refreshing in 5s...", { id: toastId })
      setTimeout(() => window.location.reload(), 5000)
    } else {
      toast.error("AI is busy. Please try in a moment.", { id: toastId })
    }
  } catch (err) {
    toast.error("Network error waking up AI.", { id: toastId })
  }
}

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold">{submission.assessments?.title || 'Assessment Review'}</h1>
        <p className="text-slate-500">Candidate: {submission.candidate_email}</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border">
        <h2 className="text-lg font-semibold mb-2">AI Verdict</h2>
        {submission.ai_summary ? (
          <p className="text-slate-700 leading-relaxed">{submission.ai_summary}</p>
        ) : (
          <div className="space-y-4">
            <p className="text-amber-600 text-sm font-medium">Summary still processing...</p>
            {submission.transcript && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Raw Transcript Preview</h3>
                <p className="text-slate-500 text-sm line-clamp-4 italic">"{submission.transcript}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <Button onClick={generatePDF} className="bg-slate-900">
          <Download className="mr-2 h-4 w-4" /> Download PDF
        </Button>
        <Button onClick={() => sendEmailReport(submission.id)} variant="outline">
          <Mail className="mr-2 h-4 w-4" /> Email to Me
        </Button>
      </div>
    </div>
  )
}