"use client"

import { FileText, Download, AlertTriangle, CheckCircle, Share2, MapPin, Phone, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import ExportButton from "@/components/ExportButton" 
import { toast } from "sonner"
import { useState, useEffect } from 'react'
import { Switch } from "@/components/ui/switch"
import { createClient } from '@/lib/supabase'
import confetti from 'canvas-confetti'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { formatDistanceToNow } from 'date-fns';


interface Finding {
  item: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  fix: string;
  code_reference?: string;
  evidence_url?: string;
}

interface VerdictReportProps {
  data: {
    id: string; 
    property_address: string;
    trade_type: string;
    status: string;
    contractor_phone?: string;
    metadata?: any;
    technician_notes: {
      confidence_score: number;
      findings: Finding[];
    };
  };
  isPublicView?: boolean;
}

const triggerCelebration = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);
    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#2563eb', '#94a3b8'] });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#2563eb', '#94a3b8'] });
  }, 250);
};

export default function VerdictReport({ data, isPublicView = false }: VerdictReportProps) {
  const [fixedItems, setFixedItems] = useState<Record<number, boolean>>(data.metadata?.fixed_states || {});
  const [projectNotes, setProjectNotes] = useState(data.metadata?.project_notes || "");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const { 
    id, 
    property_address, 
    trade_type, 
    status, 
    technician_notes, 
    contractor_phone = "831-555-0199" 
  } = data;

  // 1. Inside your VerdictReport component, add this state:
const [lastUpdatedText, setLastUpdatedText] = useState("");
const lastUpdatedDate = data.metadata?.last_updated_at 
  ? new Date(Math.max(...Object.values(data.metadata.last_updated_at).map((d: any) => new Date(d).getTime())))
  : new Date();

useEffect(() => {
  const updateText = () => {
    setLastUpdatedText(`Updated ${formatDistanceToNow(lastUpdatedDate, { addSuffix: true })}`);
  };

  updateText();
  const interval = setInterval(updateText, 60000); // Refresh every minute
  return () => clearInterval(interval);
}, [lastUpdatedDate]);


  // Check for first-time visit
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('siteverdict_welcome_seen');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const closeWelcome = () => {
    localStorage.setItem('siteverdict_welcome_seen', 'true');
    setShowWelcome(false);
  };

  const saveNotes = async () => {
    const supabase = createClient();
    const timestamp = new Date().toISOString();
    const editorName = "Joy Dunn";

    const { error } = await supabase
      .from('verdicts')
      .update({ 
        metadata: { 
          ...(data.metadata || {}),
          project_notes: projectNotes,
          notes_last_edited: timestamp,
          notes_edited_by: editorName
        } 
      })
      .eq('id', id);

    if (error) {
      toast.error("Failed to save notes");
    } else {
      toast.success(`Notes saved by ${editorName}`);
    }
  };

  const toggleFixed = async (idx: number, itemName: string) => {
    const isNowFixed = !fixedItems[idx];
    const timestamp = new Date().toISOString();
    const evidenceUrl = technician_notes.findings[idx]?.evidence_url || "";

    const newFixedItems = { ...fixedItems, [idx]: isNowFixed };
    setFixedItems(newFixedItems);

    if (isNowFixed) {
      const totalFindings = technician_notes.findings.length;
      const currentFixedCount = Object.values(newFixedItems).filter(Boolean).length;
      if (currentFixedCount === totalFindings) {
        triggerCelebration();
        toast.success("All items resolved!", { icon: '🏆' });
      }
    }

    if (isPublicView) {
      const supabase = createClient();
      const updateStatus = async () => {
        const { error } = await supabase
          .from('verdicts')
          .update({ 
            metadata: { 
              ...(data.metadata || {}),
              fixed_states: newFixedItems,
              last_updated_at: { ...(data.metadata?.last_updated_at || {}), [idx]: timestamp }
            } 
          })
          .eq('id', id);
          
        if (error) throw error;

        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-fix`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ auditId: id, item: itemName, isFixed: isNowFixed, address: property_address, signedOffAt: timestamp, idx, evidenceUrl })
        });
        return isNowFixed;
      };

      toast.promise(updateStatus(), {
        loading: 'Updating...',
        success: (fixed) => `${itemName} ${fixed ? 'signed off' : 're-opened'}.`,
        error: 'Update failed.',
      });
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('audit-report-content');
    if (!element) return;

    setIsGeneratingPDF(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // --- Branded Stationery Header ---
      pdf.setFillColor(37, 99, 235); 
      pdf.rect(0, 0, pdfWidth, 25, 'F'); 
      
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.text("DUNN STRATEGIC CONSULTING", 10, 12);
      
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text("Aptos HQ • Technical Compliance Audit", 10, 18);
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 25, pdfWidth, pdfHeight);
      
      pdf.save(`Audit_${property_address.replace(/\s+/g, '_')}.pdf`);
      toast.success("Professional PDF Generated");
    } catch (err) {
      toast.error("PDF Generation failed");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/audit/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Public link copied!");
  };

  return (
    <>
      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
              <AlertTriangle className="text-blue-600 w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Welcome to SiteVerdict Beta</h2>
            <p className="text-slate-500 mb-6 leading-relaxed">
              This AI-generated audit identifies code violations. Use the <b>Mark Fixed</b> switches to sign off on corrections in real-time.
            </p>
            
            <div className="flex flex-col gap-3">
              <Button onClick={closeWelcome} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-bold">
                Got it, let's go
              </Button>
              <Button asChild variant="ghost" className="text-slate-400 hover:text-slate-600 font-medium text-sm">
                <a href={`mailto:steve@dunnstrategic.com?subject=Question regarding Audit: ${property_address}`}>
                  Technical Question? Email Support
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}

      <div id="audit-report-content" className="max-w-4xl mx-auto p-6 space-y-6 bg-white animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Technical Audit Report</h1>
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <MapPin className="w-4 h-4 text-blue-600" />
              {property_address}
            </div>
          </div>
          {!isPublicView && (
            <div className={`flex gap-3 ${isGeneratingPDF ? 'hidden' : ''}`}>
              <Button onClick={handleShare} variant="outline" className="rounded-xl font-bold">
                <Share2 className="w-4 h-4 mr-2" /> Share Link
              </Button>
              <Button onClick={handleDownloadPDF} variant="outline" className="rounded-xl font-bold">
                 <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
              <ExportButton auditId={id} address={property_address} />
            </div>
          )}
        </div>

        {/* Public Contact Action */}
        {isPublicView && (
          <div className={`bg-blue-50 border border-blue-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm ${isGeneratingPDF ? 'hidden' : ''}`}>
            <div className="text-center md:text-left">
              <h4 className="font-bold text-blue-900 text-lg text-pretty">Questions about these findings?</h4>
              <p className="text-blue-700 text-sm font-medium">Contact the GC to coordinate fixes.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
                <a href={`tel:${contractor_phone}`}><Phone className="w-4 h-4 mr-2" /> Call GC</a>
              </Button>
              <Button asChild variant="outline" className="flex-1 border-blue-200 text-blue-700 rounded-xl font-bold">
                <a href={`sms:${contractor_phone}?body=Re: SiteVerdict Audit at ${property_address}`}><MessageSquare className="w-4 h-4 mr-2" /> Text Proof</a>
              </Button>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="rounded-2xl border-none bg-slate-50 shadow-sm p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Trade Category</p>
            <p className="text-xl font-bold text-slate-900">{trade_type}</p>
          </Card>
          <Card className="rounded-2xl border-none bg-slate-50 shadow-sm p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Compliance Status</p>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase ${status === 'warning' || status === 'FAIL' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
              {status === 'warning' || status === 'FAIL' ? 'Action Required' : 'Verified Pass'}
            </div>
          </Card>
          <Card className="rounded-2xl border-none bg-blue-600 text-white shadow-xl p-4">
            <p className="text-xs font-bold text-blue-100 uppercase tracking-widest mb-1">AI Confidence</p>
            <p className="text-3xl font-black">{((technician_notes?.confidence_score || 0) * 100).toFixed(0)}%</p>
          </Card>
        </div>

        {/* Findings List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-4">Detailed Findings</h3>
          {technician_notes?.findings?.map((finding, idx) => {
            const isFixed = fixedItems[idx];
            const statusColor = finding.status === 'FAIL' ? 'border-l-amber-500' : 'border-l-green-500';
            return (
              <div key={idx} className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm border-l-4 ${statusColor} ${isFixed ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-bold text-lg ${isFixed ? 'line-through text-slate-400' : 'text-slate-900'}`}>{finding.item}</h4>
                      {finding.code_reference && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-mono font-bold uppercase">{finding.code_reference}</span>}
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">{finding.fix}</p>
                    {isFixed && data.metadata?.last_updated_at?.[idx] && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-green-600 uppercase">Verified Fix • {new Date(data.metadata.last_updated_at[idx]).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  {isPublicView && finding.status === 'FAIL' && (
                    <div className={`flex flex-col items-center gap-2 pl-4 border-l min-w-[80px] ${isGeneratingPDF ? 'hidden' : ''}`}>
                      <span className={`text-[10px] font-black uppercase ${isFixed ? 'text-green-600' : 'text-slate-400'}`}>{isFixed ? 'Resolved' : 'Mark Fixed'}</span>
                      <Switch checked={isFixed || false} onCheckedChange={() => toggleFixed(idx, finding.item)} className="data-[state=checked]:bg-green-600" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Admin Notes */}
        {!isPublicView && (
          <div className={`mt-8 bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4 shadow-inner ${isGeneratingPDF ? 'hidden' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900">Admin & Partner Notes</h3>
            </div>
            <textarea
              value={projectNotes}
              onChange={(e) => setProjectNotes(e.target.value)}
              placeholder="Add internal feedback..."
              className="w-full min-h-[120px] p-4 rounded-2xl border-none bg-white text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            {data.metadata?.notes_last_edited && (
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                Last updated {new Date(data.metadata.notes_last_edited).toLocaleString()} by {data.metadata.notes_edited_by || 'Admin'}
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={saveNotes} className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-6 font-bold">
                Save Internal Notes
              </Button>
            </div>
          </div>
        )}

        {isPublicView && projectNotes && (
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-3xl p-6">
            <h4 className="font-bold text-blue-900 mb-2">Director's Comments</h4>
            <p className="text-blue-800 text-sm italic leading-relaxed">"{projectNotes}"</p>
          </div>
        )}

        {/* Photo Gallery */}
        <div className="mt-12 space-y-4">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Inspection Evidence</h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold">{data.metadata?.evidence_photos?.length || 0} Assets Analyzed</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.metadata?.evidence_photos?.map((photoUrl: string, i: number) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group relative">
                <img src={photoUrl} alt={`Evidence ${i}`} className="object-cover w-full h-full transition-transform group-hover:scale-110" />
              </div>
            )) || <p className="col-span-full text-center text-slate-400 py-12 border-2 border-dashed rounded-3xl">No evidence photos available.</p>}
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-4 text-[9px] font-medium uppercase tracking-widest text-slate-400">
  <a href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</a>
  <span>•</span>
  <a href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
  <span>•</span>
  <a href={`mailto:support@siteverdict.online`} className="hover:text-blue-600 transition-colors">Contact Support</a>
</div>
      </div>
    </>
  );
}