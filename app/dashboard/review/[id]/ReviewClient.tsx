"use client"
import { Printer, Mail, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase" // Ensure this matches your project structure
import { useState } from "react" 

export default function ReviewClient({ submission }: { submission: any }) {
  const [isSending, setIsSending] = useState(false);
  
  // Initialize the Supabase client
  const supabase = createClient();

  const handleSendEmail = async () => {
    // Debug: Find which field contains the email
    console.log("Full Submission Object:", submission);

    const targetEmail = submission.candidate_email || submission.email || submission.user_email;

    if (!targetEmail) {
      alert("Error: No email address found for this submission. Check console.");
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
      alert("Success! Audit sent to the contractor.");
    } catch (error) {
      console.error("Send Email Error:", error);
      alert("Failed to send email. Check the browser console.");
    } finally {
      setIsSending(false);
    }
  };

  const handlePrint = () => { 
    window.print(); 
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Action Header */}
      <div className="flex justify-end gap-3 mb-6 no-print">
        <Button 
          onClick={handleSendEmail} 
          disabled={isSending}
          variant="default"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          {isSending ? "Sending..." : "Send to Contractor"}
        </Button>

        <Button 
          onClick={handlePrint} 
          variant="outline" 
          className="flex items-center gap-2 border-slate-200"
        >
          <Printer className="h-4 w-4" />
          Print to PDF
        </Button>
      </div>

      {/* Audit Content */}
      <div className="print:block border rounded-lg p-8 bg-white shadow-sm">
        <header className="mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-slate-900">SiteVerdict.online Technical Audit</h1>
          <p className="text-slate-500">Property: {submission.assessments?.title || "Residential Site"}</p>
        </header>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">AI Verdict Summary</h2>
          <p className="text-slate-700">{submission.ai_summary || "No summary found."}</p>
        </div>
      </div>

      {/* Global CSS for Clean Printing */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .print\:block { display: block !important; }
          .shadow-sm { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
        }
      `} </style>
    </div>
  )
}