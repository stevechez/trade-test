'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MuxPlayer from '@mux/mux-player-react'
import { Loader2 } from 'lucide-react' // Lucide-react comes with most shadcn installs

export default function VideoLoader({ 
  submissionId, 
  initialPlaybackId,
  title 
}: { 
  submissionId: string, 
  initialPlaybackId: string | null,
  title?: string 
}) {
  const [playbackId, setPlaybackId] = useState(initialPlaybackId)
  const router = useRouter()

  useEffect(() => {
    
    // If we already have the video, no need to poll
    if (playbackId) return

    // Inside your useEffect...
const interval = setInterval(async () => {
  try {
    const res = await fetch(`/api/submissions/${submissionId}/status`)
    
    // Safety 1: Check if the network request was successful
    if (!res.ok) return 

    const data = await res.json()

    // Safety 2: Check if data exists AND has the playback ID
    if (data && data.mux_playback_id) {
      setPlaybackId(data.mux_playback_id)
      router.refresh()
      clearInterval(interval)
    }
  } catch (err) {
    console.error("Polling error:", err)
  }
}, 5000)

    return () => clearInterval(interval)
  }, [playbackId, submissionId, router])

  if (!playbackId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white bg-slate-900 px-6 text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <div className="space-y-1">
          <p className="font-semibold text-lg">AI is processing your walkthrough</p>
          <p className="text-sm text-slate-400">Generating high-speed playback and analysis...</p>
        </div>
      </div>
    )
  }

  return (
    <MuxPlayer
      playbackId={playbackId}
      metadataVideoTitle={title}
      accentColor="#2563eb"
      className="w-full h-full"
    />
  )
}