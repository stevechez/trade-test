"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"

export default function DynamicAssessmentBuilder() {
  const [questions, setQuestions] = useState(['']) // Start with one empty question
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const addQuestion = () => setQuestions([...questions, ''])
  
  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[index] = value
    setQuestions(newQuestions)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const formData = new FormData(e.currentTarget)
    
    let imageUrl = ''
    if (file) {
      const fileName = `${Math.random()}.jpg`
      const { data: uploadData } = await supabase.storage.from('assessment-images').upload(fileName, file)
      if (uploadData) imageUrl = supabase.storage.from('assessment-images').getPublicUrl(uploadData.path).data.publicUrl
    }

    const { data, error } = await supabase.from('assessments').insert({
      title: formData.get('title'),
      problem_image_url: imageUrl,
      questions: questions.filter(q => q.trim() !== ''), // Only save non-empty questions
      required_keywords: (formData.get('keywords') as string).split(',').map(k => k.trim())
    }).select().single()

    if (error) alert(error.message)
    else router.push(`/test/${data.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">New Trade Assessment</h1>
        <Input name="title" placeholder="e.g., Plumbing Rough-In Inspection" required />
        <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </div>

      <div className="space-y-4">
        <Label>Assessment Walkthrough Questions (Add up to 10)</Label>
        {questions.map((q, index) => (
          <div key={index} className="flex gap-2">
            <span className="mt-2 text-sm font-bold text-slate-400">{index + 1}.</span>
            <Input 
              value={q} 
              onChange={(e) => updateQuestion(index, e.target.value)}
              placeholder="e.g. 'Show the T&P discharge pipe and explain the slope.'"
              required
            />
            <Button type="button" variant="ghost" onClick={() => removeQuestion(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addQuestion} className="w-full">
          <Plus className="h-4 w-4 mr-2" /> Add Question
        </Button>
      </div>

      <Input name="keywords" placeholder="Keywords for AI (comma separated)" />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Generate Multi-Question Test"}
      </Button>
    </form>
  )
}