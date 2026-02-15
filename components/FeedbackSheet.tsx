"use client"

import { useState } from "react"
import { createClient } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet"
import { MessageSquarePlus, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function FeedbackSheet() {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const submitFeedback = async () => {
    if (!text.trim()) return;
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('feedback')
        .insert([{ 
          content: text, 
          user_id: user?.id,
          source: 'dashboard_sheet' 
        }])

      if (error) throw error
      
      toast.success("Feedback received!")
      setText("")
    } catch (err) {
      toast.error("Couldn't save feedback")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquarePlus className="h-4 w-4" /> Feedback
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Beta Feedback</SheetTitle>
          <SheetDescription>
            How can we make these trade verdicts more accurate for your projects?
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-6">
          <Textarea 
            placeholder="Tell us what's working or what's broken..." 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            className="min-h-[150px]"
          />
          <Button onClick={submitFeedback} disabled={loading || !text}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Feedback"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}