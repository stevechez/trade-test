import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { VerdictPDF } from '@/components/VerdictPDF'; 
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase'; 

/**
 * CHUNK 1: PUBLIC URL GETTER
 * Ensures images stored in Supabase are accessible to the PDF renderer.
 */
const getPublicEvidenceUrl = (supabase: any, path: string) => {
  if (!path) return null;
  const { data } = supabase
    .storage
    .from('audit-evidence') 
    .getPublicUrl(path);

  return data.publicUrl;
};

export async function POST(req: Request) {
  try {
    const { auditId } = await req.json();
    const supabase = createClient();

    // 1. Fetch Audit Data
    const { data: audit, error } = await supabase
      .from('verdicts')
      .select('*')
      .eq('id', auditId)
      .single();

    if (error || !audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    // 2. Data Enrichment
    const enrichedFindings = (audit.technician_notes?.findings || []).map((finding: any) => ({
      ...finding,
      image_url: finding.image_url?.startsWith('http') 
        ? finding.image_url 
        : getPublicEvidenceUrl(supabase, finding.image_url)
    }));

    const reportData = {
      ...audit,
      technician_notes: {
        ...audit.technician_notes,
        findings: enrichedFindings
      }
    };

    /**
     * CHUNK 3: RENDER TO STREAM
     * React.createElement avoids the "arithmetic operation" (ts 2362) error 
     * by bypassing JSX syntax that the compiler is misinterpreting.
     */
    const pdfElement = React.createElement(VerdictPDF, { data: reportData });
const stream = await renderToStream(pdfElement as any);    
    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="SiteVerdict_Audit_${auditId}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF Export Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}