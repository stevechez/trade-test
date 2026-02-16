"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase' 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select" // Ensure these Radix components are installed
import { toast } from "sonner"
import { Construction, CheckCircle2 } from "lucide-react"

export default function LeadForm() {
  const [loading, setLoading] = useState(false)
  const [trade, setTrade] = useState<string>("")
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const payload = {
      full_name: formData.get('full_name'),
      email: formData.get('email'),
      company: formData.get('company'), // Company Name
      trade_type: trade,                // Pivoted from 'Agency'
      status: 'beta_pending'            // Flag for your backend to identify beta users
    }

    // Ensure your Supabase table 'leads' has these columns!
    const { error } = await supabase.from('leads').insert(payload)

    if (error) {
      console.error("Supabase Error:", error.message)
      toast.error("Unable to join. You may already be on the list!")
    } else {
      toast.success("Access Granted. Check your email for the Command Center link.")
      // Optional: Redirect to dashboard after successful signup
      // window.location.href = "/dashboard" 
      e.currentTarget.reset()
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form 
        onSubmit={handleSubmit} 
        className="space-y-4 bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
            <Construction className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Beta Access</h3>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Trade Professional Pilot</p>
          </div>
        </div>
        
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Verify sub-work and generate automated code audits instantly. 
          Limited slots available for the Santa Cruz County pilot.
        </p>

        <div className="space-y-3">
          <Input 
            name="full_name" 
            placeholder="Full Name" 
            required 
            className="h-12 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
          />
          <Input 
            name="email" 
            type="email" 
            placeholder="Work Email" 
            required 
            className="h-12 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
          />
          <Input 
            name="company" 
            placeholder="Company Name" 
            className="h-12 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
          />
          
          <Select onValueChange={setTrade} required>
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none text-slate-500 focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Primary Trade Type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="general">General Contractor</SelectItem>
              <SelectItem value="electrical">Electrical</SelectItem>
              <SelectItem value="plumbing">Plumbing</SelectItem>
              <SelectItem value="hvac">HVAC</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          type="submit" 
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95 mt-4"
          disabled={loading}
        >
          {loading ? "Authorizing..." : "Get Started Free"}
        </Button>
        
        <div className="flex justify-center items-center gap-2 mt-6">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <p className="text-[11px] font-medium text-slate-400">
            Secure, encrypted, and trade-ready.
          </p>
        </div>
      </form>
    </div>
  )
}