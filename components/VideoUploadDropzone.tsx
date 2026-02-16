"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileVideo, CheckCircle2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'

export default function VideoUploadZone({ auditId }: { auditId?: string }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const supabase = createClient();

  // Inside VideoUploadZone.tsx
const [isAnalyzing, setIsAnalyzing] = useState(false);

const startPolling = (videoPath: string) => {
  setIsAnalyzing(true);
  const interval = setInterval(async () => {
    const { data } = await supabase
      .from('verdicts')
      .select('status')
      .eq('video_path', videoPath)
      .single();

    if (data?.status === 'COMPLETED') {
      clearInterval(interval);
      setIsAnalyzing(false);
      window.location.href = `/dashboard/verdict/${videoPath}`; // Redirect to the finished report
    }
  }, 3000);
};

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setProgress(10); // Start progress

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `raw-uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('audits')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setProgress(100);
      setCompleted(true);
      toast.success("Video uploaded. AI Analysis starting...");
      
      // Here you would trigger your AI processing Edge Function
    } catch (error) {
      toast.error("Upload failed. Check your connection.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  }, [supabase]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi'] },
    multiple: false
  });

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <div 
        {...getRootProps()} 
        className={`
          relative border-4 border-dashed rounded-3xl p-12 transition-all cursor-pointer
          flex flex-col items-center justify-center text-center
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}
          ${completed ? 'border-green-500 bg-green-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {completed ? (
          <div className="animate-in zoom-in">
            <CheckCircle2 className="w-16 h-16 text-green-600 mb-4 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">Footage Received</h3>
            <p className="text-slate-500">The AI is now reviewing the trade work.</p>
          </div>
        ) : (
          <>
            <div className={`p-4 rounded-full mb-4 ${uploading ? 'bg-blue-100' : 'bg-white shadow-sm'}`}>
              {uploading ? (
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              ) : (
                <Upload className="w-10 h-10 text-slate-400" />
              )}
            </div>
            
            <h3 className="text-xl font-bold text-slate-900">
              {uploading ? `Uploading... ${progress}%` : "Drop Audit Video Here"}
            </h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto">
              {uploading 
                ? "Don't close this window while we move the heavy files." 
                : "Record a 60-second walkthrough of the trade work and drop it here."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}