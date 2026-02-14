"use client"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ReviewClient({ submission }: { submission: any }) {
  // Logic to handle professional printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Action Header */}
      <div className="flex justify-end gap-3 mb-6 no-print">
        <Button 
          onClick={handlePrint} 
          variant="outline" 
          className="flex items-center gap-2 border-slate-200"
        >
          <Printer className="h-4 w-4" />
          Print to PDF
        </Button>
        {/* ... Share Button ... */}
      </div>

      {/* Audit Content */}
      <div className="print:block">
        <header className="hidden print:block mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-slate-900">SiteVerdict.online Technical Audit</h1>
          <p className="text-slate-500">Property: {submission.assessments?.title}</p>
        </header>

        {/* ... Rest of your Video/Verdict UI ... */}
      </div>

      {/* Global CSS for Clean Printing */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .print\:block { display: block !important; }
          .shadow-2xl, .shadow-xl { shadow: none !important; border: 1px solid #e2e8f0 !important; }
        }
      `} </style>
    </div>
  )
}