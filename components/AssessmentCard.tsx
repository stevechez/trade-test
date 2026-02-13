'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { Link as LinkIcon, Wrench, ArrowRight, Trash2 } from "lucide-react"
import Link from "next/link"
import { createClient } from '@/lib/supabase' 
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { formatDistanceToNow } from 'date-fns'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export function AssessmentCard({ assessment }: { assessment: any }) {
  const router = useRouter()
  const supabase = createClient()
  
  // State
  const [isActive, setIsActive] = useState(assessment.is_active ?? true)
  const [priority, setPriority] = useState(assessment.priority || 'Medium')

  // Computed Values
  const lastUpdated = assessment.updated_at 
    ? formatDistanceToNow(new Date(assessment.updated_at), { addSuffix: true })
    : 'Recently'

  const passedCount = assessment.submissions?.filter((s: any) => s.status === 'passed').length || 0
  const reviewCount = assessment.submissions?.filter((s: any) => s.status === 'needs_review').length || 0
  const keywordCount = assessment.required_keywords?.length || 0

  const priorityColors: Record<string, string> = {
    High: "bg-red-100 text-red-700 border-red-200",
    Medium: "bg-blue-100 text-blue-700 border-blue-200",
    Low: "bg-slate-100 text-slate-700 border-slate-200"
  }

  // Actions
  const updatePriority = async (newPriority: string) => {
    setPriority(newPriority)
    const { error } = await supabase
      .from('assessments')
      .update({ priority: newPriority })
      .eq('id', assessment.id)

    if (error) {
      toast.error("Failed to update priority")
      setPriority(assessment.priority)
    } else {
      toast.success(`Priority set to ${newPriority}`)
    }
  }

  const toggleActive = async (checked: boolean) => {
    setIsActive(checked)
    const { error } = await supabase
      .from('assessments')
      .update({ is_active: checked })
      .eq('id', assessment.id)

    if (error) {
      toast.error("Failed to update status")
      setIsActive(!checked)
    } else {
      toast.success(checked ? "Assessment is now LIVE" : "Assessment is now DISABLED")
    }
  }

  const copyCandidateLink = () => {
    const url = `${window.location.origin}/test/${assessment.id}`
    navigator.clipboard.writeText(url)
    toast.success("Link copied to clipboard!")
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete "${assessment.title}"?`)
    if (!confirmed) return

    const { error } = await supabase.from('assessments').delete().eq('id', assessment.id)
    if (error) {
      toast.error("Error deleting assessment")
    } else {
      toast.success("Assessment deleted")
      router.refresh()
    }
  }

  return (
    <Card className={`hover:shadow-md transition-all relative group ${!isActive ? 'opacity-70 bg-slate-50' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`w-fit text-[9px] font-black uppercase px-2 py-0.5 rounded border transition-colors ${priorityColors[priority]}`}>
                {priority} Priority
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => updatePriority('High')}>High</DropdownMenuItem>
              <DropdownMenuItem onClick={() => updatePriority('Medium')}>Medium</DropdownMenuItem>
              <DropdownMenuItem onClick={() => updatePriority('Low')}>Low</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <CardTitle className="text-lg font-bold">{assessment.title}</CardTitle>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-green-600' : 'text-slate-400'}`}>
              {isActive ? '● Active' : '○ Paused'}
            </span>
            <span className="text-[10px] text-slate-400 border-l pl-2">
              {lastUpdated}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={isActive} onCheckedChange={toggleActive} />
          
          <button onClick={copyCandidateLink} className="text-slate-400 hover:text-blue-600 p-1 transition-colors">
            <LinkIcon className="h-4 w-4" />
          </button>
          
          <div className="flex items-center text-slate-500 text-sm">
            <Wrench className="h-4 w-4 mr-1" />
            {keywordCount}
          </div>

          <button onClick={handleDelete} className="text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all p-1">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex gap-2 mb-4">
          {passedCount > 0 && (
            <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-100">
              {passedCount} PASSED
            </span>
          )}
          {reviewCount > 0 && (
            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100">
              {reviewCount} NEEDS REVIEW
            </span>
          )}
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
          {assessment.description || "No description provided."}
        </p>
        
        <div className="flex gap-2">
          <Link href={`/dashboard/review/${assessment.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">View Submissions</Button>
          </Link>
          <Link href={`/test/${assessment.id}`}>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}