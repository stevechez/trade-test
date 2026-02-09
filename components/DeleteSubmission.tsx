"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DeleteSubmission({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this submission?")) return

    setIsDeleting(true)
    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('id', id)

    if (error) {
      alert("Error deleting: " + error.message)
      setIsDeleting(false)
    } else {
      router.refresh() // Updates the server component list
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleDelete} 
      disabled={isDeleting}
      className="text-slate-400 hover:text-red-600"
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  )
}