"use client"
import { createClient } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` }
    })
    if (error) alert(error.message)
    else alert('Check your email for the login link!')
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <Input 
          type="email" 
          placeholder="Your Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <Button className="w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Send Magic Link'}
        </Button>
      </form>
    </div>
  )
}