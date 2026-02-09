import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-6">
      <div className="bg-green-100 p-4 rounded-full">
        <CheckCircle2 className="w-16 h-16 text-green-600" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Submission Sent!</h1>
        <p className="text-slate-500 max-w-xs mx-auto">
          Your video response has been successfully uploaded and is being reviewed by the team.
        </p>
      </div>

      <div className="w-full max-w-xs pt-8">
        <Link href="/">
          <Button variant="outline" className="w-full">
            Return Home
          </Button>
        </Link>
      </div>
      
      <p className="text-[10px] text-slate-400 uppercase tracking-widest pt-12">
        Trade Verification System
      </p>
    </div>
  )
}