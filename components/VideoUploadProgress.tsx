"use client"

import { createClient } from '@/lib/supabase' //
import { Progress } from "@/components/ui/progress"
import { useState } from "react"
import * as tus from "tus-js-client"

export default function VideoUploadProgress({ file, onComplete }: { file: File, onComplete: (url: string) => void }) {
  const [progress, setProgress] = useState(0)
  const supabase = createClient() // Add this line to fix the "Cannot find name" error

  const startUpload = async () => {
    // Now 'supabase' is defined and can fetch the session
    const { data: { session } } = await supabase.auth.getSession()

    const upload = new tus.Upload(file, {
      endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
      // ... rest of the tus config ...
    })
    
    upload.start()
  }
  
  // ... render logic ...
}