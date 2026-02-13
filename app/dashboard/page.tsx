'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input } from "@/components/ui/input"
import { Search, Loader2, XCircle } from "lucide-react"
import { AssessmentCard } from "@/components/AssessmentCard"
import { createClient } from "@/lib/supabase" // Using the established path
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

// 1. Move static weights outside to avoid re-renders
const PRIORITY_WEIGHTS: Record<string, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
}

export default function Dashboard() {
  const [assessments, setAssessments] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [priorityFilter, setPriorityFilter] = useState('All')

  const supabase = createClient()

  useEffect(() => {
    async function fetchAssessments() {
      const { data, error } = await supabase
        .from('assessments')
        .select('*, submissions(status)')
      
      if (!error && data) {
        setAssessments(data)
      }
      setLoading(false)
    }
    fetchAssessments()
  }, [])

  // 2. Calculate counts for the filter dropdown
  const counts = useMemo(() => ({
    All: assessments.length,
    High: assessments.filter(a => a.priority === 'High').length,
    Medium: assessments.filter(a => a.priority === 'Medium').length,
    Low: assessments.filter(a => a.priority === 'Low').length,
  }), [assessments])

  // 3. Centralized Filter and Sort Logic
  const processedAssessments = useMemo(() => {
    return assessments
      .filter(assessment => {
        const matchesSearch = 
          assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (assessment.description || "").toLowerCase().includes(searchQuery.toLowerCase())
        const matchesPriority = priorityFilter === 'All' || assessment.priority === priorityFilter
        return matchesSearch && matchesPriority
      })
      .sort((a, b) => {
        const weightA = PRIORITY_WEIGHTS[a.priority] || 0
        const weightB = PRIORITY_WEIGHTS[b.priority] || 0
        
        if (weightB !== weightA) return weightB - weightA
        
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
      })
  }, [assessments, searchQuery, priorityFilter])

  const resetFilters = () => {
    setSearchQuery('')
    setPriorityFilter('All')
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Assessments</h1>
        
        <div className="flex items-center gap-4">
          {/* Clear Filters Button (Only shows when filters are active) */}
          {(searchQuery || priorityFilter !== 'All') && (
            <Button variant="ghost" onClick={resetFilters} className="text-slate-500 h-9 px-2">
              <XCircle className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Priority Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Projects ({counts.All})</SelectItem>
              <SelectItem value="High" className="text-red-600">High ({counts.High})</SelectItem>
              <SelectItem value="Medium" className="text-blue-600">Medium ({counts.Medium})</SelectItem>
              <SelectItem value="Low" className="text-slate-600">Low ({counts.Low})</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search projects..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedAssessments.length > 0 ? (
          processedAssessments.map(assessment => (
            <AssessmentCard key={assessment.id} assessment={assessment} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
            <p className="text-slate-500 italic">No assessments found matching your criteria.</p>
            <Button variant="link" onClick={resetFilters}>Reset all filters</Button>
          </div>
        )}
      </div>
    </div>
  )
}