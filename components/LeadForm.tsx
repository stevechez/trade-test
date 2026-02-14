"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase' // Adjust based on your client path
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { UserPlus } from "lucide-react"

export default function LeadForm() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const payload = {
      full_name: formData.get('full_name'),
      email: formData.get('email'),
      company: formData.get('company'),
    }

    const { error } = await supabase.from('leads').insert(payload)

    if (error) {
      toast.error("Could not join list. You might already be registered!")
    } else {
      toast.success("Welcome! We'll reach out about the pilot program shortly.")
      e.currentTarget.reset()
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form 
        onSubmit={handleSubmit} 
        className="space-y-4 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-500"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <UserPlus className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Join the Pilot</h3>
        </div>
        
        <p className="text-sm text-slate-500 mb-4">
          Get early access to AI trade verdicts for your listings in Santa Cruz County.
        </p>

        <div className="space-y-3">
          <Input 
            name="full_name" 
            placeholder="Full Name" 
            required 
            className="h-12 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
          <Input 
            name="email" 
            type="email" 
            placeholder="Work Email" 
            required 
            className="h-12 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
          <Input 
            name="company" 
            placeholder="Agency (e.g., Coldwell Banker)" 
            className="h-12 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]"
          disabled={loading}
        >
          {loading ? "Registering..." : "Get Started Free"}
        </Button>
        
        <p className="text-[10px] text-center text-slate-400 mt-4 leading-tight">
          By joining, you agree to participate in the SiteVerdict.online beta program.
        </p>
      </form>
    </div>
  )
}