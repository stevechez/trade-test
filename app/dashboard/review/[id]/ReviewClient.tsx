"use client"

import { Printer, Mail, Loader2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase" 
import { useState } from "react" 
import { toast } from "sonner"

interface ReviewClientProps {
  submission: {
    id: string;
    candidate_email: string;
    status: string;
    email?: string;
    user_email?: string;
    assessments?: {
      title: string;
    };
  };
}

export default function ReviewClient({ submission }: ReviewClientProps) {
  const [isSending, setIsSending] = useState(false);
  const supabase = createClient();

  // Helper to find the correct email field
  const targetEmail = submission.candidate_email || submission.email || submission.user_email || "Not Assigned";

  const handleNotifyContractor = async () => {
    if (targetEmail === "Not Assigned") {
      toast.error("No recipient email found for this audit.");
      return;
    }

    setIsSending(true);
    const toastId = toast.loading("Transmitting official report...");

    try {
      // Logic for notify-fix or send-report edge functions
      const { error } = await supabase.functions.invoke('notify-fix', {
        body: { 
          auditId: submission.id, 
          recipient: targetEmail,
          address: submission.assessments?.title || "Residential Site"
        }
      });

      if (error) throw error;
      
      toast.success("Notification Sent", {
        description: `Official report delivered to ${targetEmail}`,
        id: toastId,
      });

    } catch (error: any) {
      console.error("Function Error:", error);
      toast.error("Transmission Failed", {
        description: "Verify Supabase Edge Function connectivity.",
        id: toastId,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleExportPDF = () => { 
    window.print(); 
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      {/* Professional Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 no-print">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Audit Review</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Recipient: <span className="text-blue-600">{targetEmail}</span>
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            onClick={handleNotifyContractor} 
            disabled={isSending}
            variant="default"
            className="flex-1 md:flex-none items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold transition-all"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            {isSending ? "Sending..." : "Notify Contractor"}
          </Button>

          <Button 
            onClick={handleExportPDF} 
            variant="outline" 
            className="flex-1 md:flex-none items-center gap-2 rounded-xl font-bold border-slate-200"
          >
            <Printer className="h-4 w-4" />
            Export Official Report
          </Button>
        </div>
      </div>

      {/* The Report Document */}
      <div className="print:block border-none md:border border-slate-100 rounded-3xl p-8 md:p-12 bg-white shadow-sm overflow-hidden">
        <header className="mb-10 border-b border-slate-100 pb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">SiteVerdict</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Technical Compliance Audit</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">{submission.assessments?.title || "Residential Site"}</p>
            <p className="text-[10px] text-slate-400 font-medium">ID: {submission.id.slice(0, 8)}</p>
          </div>
        </header>

        {/* Content Area - Placeholder for findings */}
        <div className="min-h-[400px]">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-4 mb-8">
            <div className="bg-blue-100 p-3 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 uppercase">Status: {submission.status}</p>
              <p className="text-xs text-slate-500">Ready for contractor verification and sign-off.</p>
            </div>
          </div>
        </div>

        <footer className="mt-12 pt-6 border-t border-slate-50 text-center">
          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">
            © 2026 Dunn Strategic Consulting, LLC • Confidential Technical Audit
          </p>
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .print\:block { display: block !important; border: none !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  )
}