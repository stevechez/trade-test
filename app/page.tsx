"use client"
import Link from 'next/link'
import { CheckCircle2, Zap, ShieldCheck, PlayCircle } from "lucide-react"
import LeadForm from "@/components/LeadForm" 
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  // Move the scroll function inside the component
  const scrollToJoin = () => {
    const element = document.getElementById('join');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-600">SiteVerdict</h2>
        <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-blue-600">
          Sign In
        </Link>
      </nav>
      
      <main className="max-w-4xl mx-auto text-center py-24 px-6">
        <h1 className="text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
          Elite Site Audits <br /> <span className="text-blue-600">Driven by AI.</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          Built for the modern trade professional. Secure, fast, and automated reports delivered 
          directly to your team.
        </p>
        <Link href="/dashboard" className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-blue-700 transition-all">
          Launch Command Center
        </Link>
      </main>
    </div>
  )
}