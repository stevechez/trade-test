"use client"
import Link from 'next/link'
import { useState, useEffect } from 'react' // Added for auth state check
import { CheckCircle2, Zap, ShieldCheck, PlayCircle, LayoutDashboard } from "lucide-react"
import LeadForm from "@/components/LeadForm" 
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  // Use state to handle the dynamic button label based on environment/auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // In a real app, you'd check your Supabase/Auth0 session here
  useEffect(() => {
    // This ensures local and prod behave the same by checking actual session
    const checkAuth = async () => {
      // Mock check: Replace with your actual auth provider's session check
      // e.g., const { data } = await supabase.auth.getSession();
      // setIsLoggedIn(!!data.session);
    };
    checkAuth();
  }, []);

  return (
    <div className="bg-white min-h-screen selection:bg-blue-100">
      {/* Refined Navigation */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-slate-50">
        <div className="flex items-center gap-2">
           <Zap className="text-blue-600 w-6 h-6 fill-current" />
           <h2 className="text-2xl font-bold tracking-tight text-slate-900">SiteVerdict</h2>
        </div>
        <Link 
          href="/dashboard" 
          className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
        >
          {isLoggedIn ? 'Go to Dashboard' : 'Sign In'}
        </Link>
      </nav>
      
      <main className="max-w-5xl mx-auto text-center py-32 px-6">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-8 uppercase tracking-widest border border-blue-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          Beta Access: Santa Cruz County
        </div>

        <h1 className="text-7xl font-black tracking-tighter text-slate-900 mb-8 leading-[1.1]">
          Elite Site Audits <br /> 
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
            Driven by AI.
          </span>
        </h1>

        <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
          The industrial-grade audit tool for General Contractors. 
          Verify sub-work, catch violations, and generate professional 
          PDFs in minutes—not days.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/dashboard" 
            className="group flex items-center gap-2 bg-blue-600 text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all duration-200"
          >
            <LayoutDashboard className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Launch Command Center
          </Link>
          
          <button 
            onClick={() => document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-10 py-5 rounded-2xl text-lg font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Watch Demo
          </button>
        </div>
      </main>

      {/* Beta Signup Section */}
      <section id="join" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Join the Contractor Pilot</h2>
            <p className="text-slate-400 text-lg mb-8">
              We are currently onboarding a select group of GCs in the Santa Cruz area. 
              Get your first 5 verdicts free and help shape the future of site oversight.
            </p>
            <ul className="space-y-4">
              {[
                "Automated Code Violation Detection",
                "Instant Professional PDF Reports",
                "Subcontractor Accountability Vault"
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="text-blue-500 w-5 h-5" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-2xl">
            {/* LeadForm is now geared toward your actual data structure */}
            <LeadForm /> 
          </div>
        </div>
      </section>
    </div>
  )
}