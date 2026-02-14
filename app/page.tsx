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
    <div className="bg-white text-slate-900 font-sans selection:bg-blue-100">
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-8 shadow-sm border border-blue-100">
            <Zap className="h-4 w-4" /> Now Beta Testing: Santa Cruz & Santa Clara County
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-[1.1]">
            Stop Waiting on Contractors. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
              Instant Trade Verdicts.
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Record a 60-second walkthrough in **Aptos** or **Sunnyvale**. Receive a professional 
            AI Trade Audit in minutes. Close deals faster with technical clarity your clients can trust.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Button 
              size="lg" 
              onClick={scrollToJoin}
              className="bg-slate-900 hover:bg-slate-800 text-white h-14 px-8 text-lg rounded-xl shadow-xl shadow-slate-200 transition-transform hover:scale-105"
            >
              Get Your First Verdict Free
            </Button>
            
            <Link href="/case-study">
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-8 text-lg rounded-xl flex gap-2 border-slate-200 hover:bg-slate-50"
              >
                <PlayCircle className="h-5 w-5" /> See the Demo
              </Button>
            </Link>
          </div>

          <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100">
             <div className="bg-white px-6 py-3 rounded-xl border border-white/50 shadow-sm">
                <p className="text-sm font-semibold text-slate-700">
                   🚀 Currently accepting <span className="text-blue-600 font-bold">20 pilot partners</span> for the Central Coast & Silicon Valley
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* 2. THE THREE PILLARS */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 text-center">
          <div className="group space-y-4 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Lightning Fast</h3>
            <p className="text-slate-500 leading-relaxed">No more waiting for trade visits. Get safety and compliance verdicts while you're still on-site.</p>
          </div>
          
          <div className="group space-y-4 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Disclosure Ready</h3>
            <p className="text-slate-500 leading-relaxed">Download "Premium Deep-Dive" PDFs to attach directly to your property disclosures.</p>
          </div>
          
          <div className="group space-y-4 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Trade-Expert AI</h3>
            <p className="text-slate-500 leading-relaxed">Our AI identifies age, capacity, and seismic strapping—details standard inspectors miss.</p>
          </div>
        </div>
      </section>

      {/* 3. FINAL CTA: The Lead Capture */}
      <section id="join" className="py-24 max-w-5xl mx-auto px-6 text-center scroll-mt-20">
        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-[3rem] p-12 md:p-20 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Scale Your Real Estate Business</h2>
            <p className="text-blue-100 text-lg mb-12 max-w-xl mx-auto">
              Join the SiteVerdict pilot. First 10 agents in Aptos get lifetime access to Premium Audits.
            </p>
            <div className="max-w-md mx-auto">
              <LeadForm />
            </div>
          </div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-sm">
          © 2026 SiteVerdict.online • Vetting Properties in Aptos, Sunnyvale, and Beyond.
        </p>
      </footer>
    </div>
  )
}