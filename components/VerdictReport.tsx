"use client"

import { FileText, Download, AlertTriangle, CheckCircle, Share2, MapPin, Phone, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import ExportButton from "@/components/ExportButton" 
import { toast } from "sonner"

// 1. Updated interfaces
interface Finding {
  item: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  fix: string;
  code_reference?: string;
}

interface VerdictReportProps {
  data: {
    id: string; 
    property_address: string;
    trade_type: string;
    status: string;
    contractor_phone?: string; // Capturing GC contact info
    technician_notes: {
      confidence_score: number;
      findings: Finding[];
    };
  };
  isPublicView?: boolean;
}

export default function VerdictReport({ data, isPublicView = false }: VerdictReportProps) {
  const { 
    id, 
    property_address, 
    trade_type, 
    status, 
    technician_notes, 
    contractor_phone = "831-555-0199" // Fallback to your pilot contact line
  } = data;

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Public link copied! Text it to your subcontractor.");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in duration-700">
      
      {/* Report Header */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Technical Audit Report</h1>
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <MapPin className="w-4 h-4 text-blue-600" />
            {property_address}
          </div>
        </div>

        {/* Action Buttons: Only visible if NOT in Public View */}
        {!isPublicView && (
          <div className="flex gap-3">
            <Button 
              onClick={handleShare} 
              variant="outline" 
              className="rounded-xl font-bold border-slate-200"
            >
              <Share2 className="w-4 h-4 mr-2" /> Share Link
            </Button>
            
            <ExportButton auditId={id} address={property_address} />
          </div>
        )}
      </div>

      {/* Public Contact Action: Prominent for Subcontractors in Public View */}
      {isPublicView && (
        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="text-center md:text-left">
            <h4 className="font-bold text-blue-900 text-lg">Questions about these findings?</h4>
            <p className="text-blue-700 text-sm opacity-90 font-medium">Contact the General Contractor directly to coordinate fixes.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button 
              asChild
              className="flex-1 md:flex-none h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
            >
              <a href={`tel:${contractor_phone}`}>
                <Phone className="w-4 h-4 mr-2" /> Call GC
              </a>
            </Button>
            <Button 
              asChild
              variant="outline"
              className="flex-1 md:flex-none h-12 px-6 border-blue-200 text-blue-700 hover:bg-blue-100 rounded-xl font-bold transition-all"
            >
              <a href={`sms:${contractor_phone}?body=Re: SiteVerdict Audit at ${property_address}`}>
                <MessageSquare className="w-4 h-4 mr-2" /> Text Proof
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* Audit Summary Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-none bg-slate-50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trade Category</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-slate-900">{trade_type}</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-none bg-slate-50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter ${
              status === 'warning' || status === 'FAIL' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
            }`}>
              {status === 'warning' || status === 'FAIL' ? 'Action Required' : 'Verified Pass'}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none bg-blue-600 text-white shadow-xl shadow-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-blue-100 uppercase tracking-widest">AI Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">
              {((technician_notes?.confidence_score || 0) * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Findings List */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="bg-slate-100/50 px-6 py-4 border-b border-slate-100 font-bold text-slate-700">
          Detailed Findings & Code References
        </div>
        <div className="divide-y divide-slate-100">
          {technician_notes?.findings?.map((finding, idx) => (
            <div key={idx} className="p-6 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
              {finding.status === 'FAIL' ? (
                <AlertTriangle className="w-6 h-6 text-amber-500 mt-1 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 text-lg leading-tight">{finding.item}</h4>
                    {finding.code_reference && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono font-bold tracking-tight">
                            {finding.code_reference}
                        </span>
                    )}
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">{finding.fix}</p>
              </div>
              <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                finding.status === 'FAIL' ? 'text-amber-600' : 'text-green-600'
              }`}>
                {finding.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}