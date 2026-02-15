"use client"

import { Printer, Mail, Loader2, Bug } from "lucide-react" // Added Bug icon for debug feel
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase" 
import { useState } from "react" 
import { toast } from "sonner"

// 1. Define what a 'submission' looks like
interface ReviewClientProps {
  submission: {
    id: string;
    title: string;
    candidate_email: string;
    video_url?: string;
    status: string;
    email?: string; // Fallback email field
    user_email?: string; // Another fallback email field
    assessments?: {
      title: string;
    };
  };
}

// 2. Tell the component to use these props
export default function ReviewClient({ submission }: ReviewClientProps) {  const [isSending, setIsSending] = useState(false);
  const supabase = createClient();

  const handleSendEmail = async () => {
    // 1. DATA LOOKUP: Try to find the email in your schema
    const targetEmail = submission.candidate_email || submission.email || submission.user_email;

    // 2. THE DEBUG ALERT: This runs in your browser
    const debugInfo = `
      --- DEBUG PAYLOAD ---
      Submission ID: ${submission.id}
      Target Email: ${targetEmail || "NOT FOUND"}
      Available Fields: ${Object.keys(submission).join(", ")}
      ---------------------
    `;
    alert(debugInfo);
    console.log("Full Submission Data:", submission);

    if (!targetEmail) {
      alert("Error: No email address found in this submission record.");
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-report', {
        body: { 
          submissionId: submission.id, 
          userEmail: targetEmail 
        }
      });

      if (error) throw error;
      
      // 2. Trigger the Success Toast
      toast.success("Verdict Sent!", {
        description: `Email delivered to ${targetEmail}`,
        duration: 5000,
      });

    } catch (error: any) {
      console.error("Function Error:", error);
      // 3. Trigger Error Toast
      toast.error("Send Failed", {
        description: error.message || "Check Supabase Function Logs",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handlePrint = () => { window.print(); };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-end gap-3 mb-6 no-print">
        <Button 
          onClick={handleSendEmail} 
          disabled={isSending}
          variant="default"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          {isSending ? "Sending..." : "Send to Contractor"}
        </Button>

        <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print to PDF
        </Button>
      </div>

      <div className="print:block border rounded-lg p-8 bg-white shadow-sm">
        <header className="mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-slate-900">SiteVerdict Technical Audit</h1>
          <p className="text-slate-500">Property: {submission.assessments?.title || "Residential Site"}</p>
        </header>
        <div className="bg-slate-50 p-4 rounded border text-sm font-mono text-slate-600">
          <p><strong>Debug Status:</strong> Ready to transmit to {submission.candidate_email || "unknown"}</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .print\:block { display: block !important; }
        }
      `}</style>
    </div>
  )
}