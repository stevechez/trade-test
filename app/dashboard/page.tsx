import { createClient } from '@/lib/supabase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DeleteSubmission from '@/components/DeleteSubmission'

export default async function EmployerDashboard() {
  const supabase = createClient()

  // 1. Fetch submissions from the database
  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('*, assessments(title)')
    .order('created_at', { ascending: false })

  if (error) return <div>Error loading submissions: {error.message}</div>

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Candidate Reviews</h1>
        <p className="text-muted-foreground">Verify skills for your open job sites.</p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Assessment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions?.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">
                  {new Date(sub.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{sub.assessments?.title || 'General Test'}</TableCell>
                <TableCell>
                  <Badge variant={sub.status === 'completed' ? 'default' : 'secondary'}>
                    {sub.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <a 
                    href={`/dashboard/review/${sub.id}`} 
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    Watch Review →
                  </a>
                </TableCell>
                // Inside your TableRow map...
<TableCell className="text-right flex justify-end gap-2">
  <a href={`/dashboard/review/${sub.id}`} className="hover:underline text-blue-600 text-sm mt-2">
    Review
  </a>
  <DeleteSubmission id={sub.id} />
</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}