"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck 
} from "lucide-react"
import { toast } from "sonner"
import VerdictReport from '@/components/VerdictReport' 

export default function ContractorSharePage({ params }: { params: { id: string } }) {
  // 1. Core State & Clients
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testQuestions, setTestQuestions] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const searchParams = useSearchParams()
  const supabase = createClient()
  const encodedEmail = searchParams.get('ref')

  // 2. Data Fetching Logic
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
  }, [params.id, supabase])

  // 3. Identity Decoding
  let contractorName = "Partner"
  if (encodedEmail) {
    try {
      contractorName = atob(encodedEmail).split('@')[0]
    } catch (e) { 
      console.error("Identity decode failed") 
    }
  }

  // 4. Submission Handler
  const handleSubmitQuestions = async () => {
    if (testQuestions.length < 10) {
      toast.error("Please enter your test questions.");
      return;
    }

    setIsSubmitting(true);
    try {
      const currentMetadata = reportData?.metadata || {};

      const { error } = await supabase
        .from('verdicts')
        .update({ 
          metadata: { 
            ...currentMetadata as object, 
            contractor_test_questions: testQuestions 
          } as any 
        })
        .eq('id', params.id);

      if (error) throw error;

      setSubmitted(true);
      toast.success("Alpha Feedback Logged!");
    } catch (err: any) {
      console.error("Metadata Update Error:", err);
      toast.error("Could not save: " + (err.message || "Database error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Loading & Error States
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
      {/* Personalized Welcome Banner */}
      <div className="bg-blue-600 py-3 px-6 text-white text-center shadow-md no-print">
        <p className="text-xs font-bold uppercase tracking-widest">
          Welcome, {contractorName} • SiteVerdict Alpha Portal
        </p>
      </div>

      <main className="py-8">
        {/* Main Audit Data */}
        <VerdictReport data={reportData} isPublicView={true} />
      </main>

      {/* Contractor Feedback Section */}
      <div className="max-w-4xl mx-auto px-6 pb-20 no-print">
        <div className="bg-white border-2 border-dashed border-blue-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Alpha Test: 5 Questions</h3>
          </div>

          {!submitted ? (
            <div className="space-y-4">
              <p className="text-slate-500 text-sm">
                Please enter your 5 technical test questions below. These will be reviewed by **Dunn Strategic Consulting** to calibrate the AI logic.
              </p>
              <Textarea 
                placeholder="1. How does the AI handle...&#10;2. Can it detect...&#10;3. ..."
                className="min-h-[200px] rounded-2xl border-slate-200 focus:ring-blue-600 bg-slate-50/50"
                value={testQuestions}
                onChange={(e) => setTestQuestions(e.target.value)}
              />
              <Button 
                onClick={handleSubmitQuestions} 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-2xl shadow-lg transition-all"
              >
                {isSubmitting ? "Saving to Database..." : "Submit 5-Question Test"}
                <Send className="ml-2 w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center py-6 animate-in fade-in zoom-in duration-500">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="font-bold text-slate-900">Feedback Logged Successfully</p>
              <p className="text-sm text-slate-500">Your professional verdict has been saved for review.</p>
            </div>
          )}
        </div>
      </div>

      <footer className="py-12 text-center text-slate-400 text-[9px] font-bold uppercase tracking-widest border-t border-slate-100 mt-10">
        Dunn Strategic Consulting LLC • Santa Cruz County, CA
      </footer>
    </div>
  )
}