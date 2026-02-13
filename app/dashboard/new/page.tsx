'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase' // Adjust to your client path
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function NewAssessmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [keywords, setKeywords] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    
    const formData = new FormData(e.currentTarget)
    const title = formData.get('title')
    const description = formData.get('description')
    // Turn comma-separated string into an array for the AI
    const required_keywords = keywords.split(',').map(k => k.trim())

    const { data, error } = await supabase
      .from('assessments')
      .insert([{ title, description, required_keywords }])
      .select()
      .single()

    if (error) {
      console.error(error)
      alert("Error creating assessment")
    } else {
      router.push(`/dashboard`)
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Vetting Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Assessment Title</label>
              <Input name="title" placeholder="e.g., HVAC Final Walkthrough" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Job Description / AI Instructions</label>
              <Textarea 
                name="description" 
                placeholder="Explain what the AI should look for in the contractor's video..." 
                rows={4} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-600">
                Required Tools & Keywords (Comma separated)
              </label>
              <Input 
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., Voltage Tester, Grounding Wire, Amperage" 
              />
              <p className="text-xs text-slate-500 italic">
                The AI will explicitly check if the candidate mentions or uses these items.
              </p>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Creating..." : "Launch Assessment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}