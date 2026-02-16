"use client"

import { useState } from 'react'
import { FileDown, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ExportButtonProps {
  auditId: string;
  address: string;
}

export default function ExportButton({ auditId, address }: ExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);
    setHasDownloaded(false);

    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId }),
      });

      if (!response.ok) throw new Error('Export failed');

      // Process the stream as a Blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = `SiteVerdict_Audit_${address.split(',')[0].replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setHasDownloaded(true);
      toast.success("Audit PDF downloaded successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={isGenerating}
      className={`
        h-12 px-6 rounded-xl font-bold transition-all duration-300
        ${hasDownloaded 
          ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-100' 
          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 shadow-lg'
        }
      `}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Generating Report...
        </>
      ) : hasDownloaded ? (
        <>
          <CheckCircle className="mr-2 h-5 w-5" />
          Exported
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-5 w-5" />
          Export Technical PDF
        </>
      )}
    </Button>
  );
}