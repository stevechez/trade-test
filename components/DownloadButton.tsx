"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function DownloadPDFButton() {
  const handleDownload = () => {
    window.print(); // Triggers the print dialog
  };

  return (
    <Button 
      onClick={handleDownload}
      variant="outline" 
      className="no-print gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
    >
      <Download className="h-4 w-4" /> Download PDF
    </Button>
  );
}