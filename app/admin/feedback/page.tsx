"use client"

import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase' // Use your client-side helper
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from 'next/navigation'

export default function FeedbackAdmin() {
  const [feedback, setFeedback] = useState<any[]>([])
  const [authorized, setAuthorized] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      // 1. Check User Session
      const { data: { user } } = await supabase.auth.getUser()
      
      // 2. Simple Admin Check
      if (user?.email !== 'stevemac@example.com') { 
        router.push('/dashboard')
        return
      }

      setAuthorized(true)

      // 3. Fetch Data if authorized
      const { data } = await supabase
        .from('feedback')
        .select('*, profiles(email)') 
        .order('created_at', { ascending: false })
      
      if (data) setFeedback(data)
    }

    checkAuthAndFetch()
  }, [router, supabase])

  // Don't render the list until we know the user is you
  if (!authorized) return <div className="p-8">Verifying Admin Access...</div>

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">User Feedback Portal</h1>
      <div className="grid gap-6">
        {feedback.length > 0 ? (
          feedback.map((item) => (
            <Card key={item.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.profiles?.email || "Anonymous user"}
                </CardTitle>
                <Badge variant="outline">{new Date(item.created_at).toLocaleDateString()}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{item.content}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-slate-400">No feedback entries found yet.</p>
        )}
      </div>
    </div>
  )
}