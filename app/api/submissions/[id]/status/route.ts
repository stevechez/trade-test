import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createClient()
  
  const { data } = await supabase
    .from('submissions')
    .select('mux_playback_id, status')
    .eq('id', id)
    .single()

  return NextResponse.json(data)
}