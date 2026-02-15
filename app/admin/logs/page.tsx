"use client"

import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, RefreshCcw } from "lucide-react"
import { toast } from "sonner"

export default function EmailLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    // 1. Initial fetch
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('submissions')
        .select('id, title, candidate_email, status, created_at')
        .order('created_at', { ascending: false });
      if (data) setLogs(data);
    };

    fetchLogs();

    // 2. Subscribe to Realtime changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'submissions' },
        (payload) => {
          // Refresh the list whenever a record is created or updated
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const deleteInspectionVideo = async (fileId: string, filePath: string) => {
  const supabase = createClient(); // Use your client-side helper

  try {
    // 1. Delete the physical file from the 'site-videos' bucket
    const { error: storageError } = await supabase.storage
      .from('site-videos')
      .remove([filePath]);

    if (storageError) throw storageError;

    // 2. Delete the record from your 'submissions' table
    const { error: dbError } = await supabase
      .from('submissions')
      .delete()
      .eq('id', fileId);

    if (dbError) throw dbError;

    toast.success("Inspection data and video permanently removed.");
  } catch (err: any) {
    toast.error("Cleanup failed: " + err.message);
  }
};

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Delivery Logs</h1>
          <p className="text-slate-500">Real-time status of all sent verdicts.</p>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-200 gap-2 px-3 py-1 animate-pulse">
          <RefreshCcw className="h-3 w-3" /> Live Sync Active
        </Badge>
      </header>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Project Title</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Sent Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-medium">{log.title}</TableCell>
                <TableCell className="text-slate-500">{log.candidate_email}</TableCell>
                <TableCell>
                  {log.status === 'completed' ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Delivered
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" /> {log.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right text-slate-400">
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}