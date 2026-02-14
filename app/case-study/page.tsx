// app/case-study/page.tsx
import MuxPlayer from '@mux/mux-player-react'
import { Card, CardContent } from "@/components/ui/card"
import LeadForm from "@/components/LeadForm" // Use the lead form we built

export default function CaseStudy() {
  // Use a hardcoded playback ID from your successful tests
  const demoPlaybackId = "tg1KeDv5ZeVblVAcM77cklb3Asr32yt02K"; 

  return (
    <div className="max-w-6xl mx-auto py-16 px-6">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-slate-900 mb-4">See the Verdict in Action</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          We processed a standard water heater walkthrough in Aptos. See how our AI trade expert identified critical safety risks in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
        {/* Video Player */}
        <div className="lg:col-span-2 shadow-2xl rounded-3xl overflow-hidden bg-black aspect-video">
          <MuxPlayer playbackId={demoPlaybackId} />
        </div>

        {/* The Results */}
        <div className="space-y-6">
          <Card className="border-blue-100 bg-blue-50/50">
            <CardContent className="pt-6">
              <h3 className="font-bold text-blue-800 uppercase text-xs tracking-widest mb-4">The AI Verdict</h3>
              <div className="prose prose-sm text-slate-700 italic leading-relaxed">
                "Professional Verdict: The unit is a 40-gallon Rheem. Critical Safety Note: The T&P discharge line is improperly capped, posing a high pressure-release risk. Recommend immediate trade intervention."
              </div>
            </CardContent>
          </Card>
          
          <div className="p-4 border-l-4 border-green-500 bg-green-50">
            <p className="text-sm font-medium text-green-800">
              "This report allowed the agent to negotiate a $1,200 credit instantly."
            </p>
          </div>
        </div>
      </div>

      {/* Conversion Section */}
      <div className="bg-slate-900 rounded-3xl p-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-6">Ready to automate your property vetting?</h2>
        <LeadForm /> 
      </div>
    </div>
  )
}