"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Share2, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

// Inside your ReferralClient component
export default function ReferralClient({ profile }: { profile: any }) {
  const progress = (profile.referral_count % 3) / 3 * 100;
  
  return (
    <div className="mt-6 p-4 bg-white rounded-xl border border-blue-100">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-slate-700">Reward Progress</span>
        <span className="text-xs font-medium text-blue-600">{profile.referral_count % 3} / 3 Invites</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-blue-600 h-full transition-all duration-500" 
          style={{ width: `${progress}%` }}
        />
      </div>
      {profile.is_premium && (
        <p className="text-[10px] text-green-600 font-bold mt-2 uppercase tracking-tight">
          ★ Premium Trade Audits Unlocked
        </p>
      )}
    </div>
  )
}