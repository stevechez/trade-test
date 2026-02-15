"use client"

import { useState } from "react"
import { createClient } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function NewProjectModal() {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a video file");
    
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const candidate_email = formData.get('email') as string;

    try {
      // 1. Create the database record first
      const { data: submission, error: dbError } = await supabase
        .from('submissions')
        .insert([{ 
          title, 
          candidate_email,
          status: 'pending' 
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      // 2. Upload to Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `uploads/${submission.id}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('site-videos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Get Public URL and update the record
      const { data: { publicUrl } } = supabase.storage
        .from('site-videos')
        .getPublicUrl(filePath);

      const { error: patchError } = await supabase
        .from('submissions')
        .update({ 
          video_url: publicUrl,
          status: 'processing' 
        })
        .eq('id', submission.id);

      if (patchError) throw patchError;

      toast.success("Audit started! AI is analyzing your video.");
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2">
          <Plus className="h-4 w-4" /> New Site Audit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start Technical Audit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <Input name="title" placeholder="Property Title (e.g. Bayview Drive)" required />
          <Input name="email" placeholder="Contractor Email" type="email" required />
          
          <div className="grid gap-2">
            <label className="text-sm font-medium">Site Inspection Video</label>
            <Input 
              type="file" 
              accept="video/*" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required 
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Generate Verdict"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}