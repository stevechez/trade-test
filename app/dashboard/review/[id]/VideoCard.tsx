"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayCircle } from "lucide-react"

export default function VideoCard({ videoUrl, title }: { videoUrl: string, title: string }) {
  if (!videoUrl) {
    return (
      <Card className="bg-slate-50 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-slate-400">
          <PlayCircle className="h-12 w-12 mb-2 opacity-20" />
          <p className="text-sm font-medium">No site video available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-md border-slate-200">
      <CardHeader className="bg-slate-50 border-b py-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <PlayCircle className="h-4 w-4 text-blue-600" />
          Inspection Footage: {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 bg-black aspect-video flex items-center justify-center">
        <video 
          src={videoUrl} 
          controls 
          className="w-full h-full"
          poster="/video-placeholder.jpg" // Optional: add a thumbnail later
        >
          Your browser does not support the video tag.
        </video>
      </CardContent>
    </Card>
  );
}