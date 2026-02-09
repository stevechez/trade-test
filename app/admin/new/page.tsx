"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function NewAssessmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const formData = new FormData(e.currentTarget)
    
    let imageUrl = ''

    // 1. Upload Image to Storage if selected
    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { data: uploadData } = await supabase.storage
        .from('assessment-images') // Make sure to create this bucket!
        .upload(fileName, file)
      
      if (uploadData) {
        const { data: publicUrl } = supabase.storage
          .from('assessment-images')
          .getPublicUrl(uploadData.path)
        imageUrl = publicUrl.publicUrl
      }
    }

    // 2. Insert into Database
    const { data, error } = await supabase
      .from('assessments')
      .insert({
        title: formData.get('title'),
        prompt_text: formData.get('prompt_text'),
        problem_image_url: imageUrl,
        // Split keywords by comma and trim whitespace
        required_keywords: (formData.get('keywords') as string)
          .split(',')
          .map(k => k.trim())
      })
      .select()
      .single()

    setLoading(false)
    if (error) {
      alert(error.message)
    } else {
      router.push(`/test/${data.id}`) // Take us to see our new test!
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Skill Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Assessment Title</Label>
              <Input name="title" placeholder="e.g., Electrical Panel - Double Tap Check" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Problem Photo</Label>
              <Input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt_text">Instructions for Candidate</Label>
              <Textarea 
                name="prompt_text" 
                placeholder="Explain what the worker should look for in the photo..." 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Pro Keywords (Comma separated)</Label>
              <Input name="keywords" placeholder="e.g., pigtail, breaker, grounding" />
              <p className="text-xs text-muted-foreground">The AI will look for these in the transcript.</p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Generate Assessment Link"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}