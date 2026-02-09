"use client"
import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, StopCircle, CheckCircle2, RefreshCcw } from "lucide-react"

export default function CandidateRecorder({ onUpload }: { onUpload: (blob: Blob) => void }) {
  const [recording, setRecording] = useState(false)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true })
    if (videoRef.current) videoRef.current.srcObject = stream
    
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder
    
    const chunks: Blob[] = []
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      setVideoBlob(blob)
      stream.getTracks().forEach(track => track.stop()) // Kill camera after use
    }

    mediaRecorder.start()
    setRecording(true)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  return (
    <Card className="p-6 flex flex-col items-center gap-4 bg-slate-50">
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border-2 border-slate-200">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        {recording && <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
          <span className="text-white text-xs font-bold uppercase">Recording</span>
        </div>}
      </div>

      <div className="flex gap-4">
        {!recording && !videoBlob && (
          <Button onClick={startRecording} size="lg" className="rounded-full gap-2">
            <Camera size={20} /> Start Assessment
          </Button>
        )}
        
        {recording && (
          <Button onClick={stopRecording} variant="destructive" size="lg" className="rounded-full gap-2">
            <StopCircle size={20} /> Stop & Review
          </Button>
        )}

        {videoBlob && (
          <>
            <Button onClick={() => setVideoBlob(null)} variant="outline" className="gap-2">
              <RefreshCcw size={18} /> Retake
            </Button>
            <Button onClick={() => onUpload(videoBlob)} className="bg-green-600 hover:bg-green-700 gap-2">
              <CheckCircle2 size={18} /> Submit Video
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}