"use client"

import { useState } from 'react'
import { Star, MessageSquare, Send, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function BetaFeedback() {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Logic to save to your 'feedback' table in Supabase
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Feedback received. Thanks for building with us!");
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="text-center py-12 bg-blue-50 rounded-3xl border border-blue-100 animate-in zoom-in">
        <CheckCircle2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-2xl font-black text-slate-900">Cheers, Steven!</h3>
        <p className="text-slate-600 mt-2">Your insights are shaping the future of SiteVerdict.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="text-blue-600 w-5 h-5" />
        <h3 className="text-xl font-bold text-slate-900">Beta Tester Review</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-3">
            How accurate was the AI Verdict?
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-2 rounded-lg transition-all ${rating >= star ? 'text-amber-400 scale-110' : 'text-slate-200'}`}
              >
                <Star className="w-8 h-8 fill-current" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-3">
            What was the most useful part of the PDF?
          </label>
          <Textarea 
            placeholder="e.g. The photo evidence, the specific code references..." 
            className="rounded-xl border-slate-100 bg-slate-50 focus:ring-blue-500 min-h-[100px]"
            required
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading || rating === 0}
          className="w-full h-14 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-xl transition-all"
        >
          {loading ? "Sending..." : "Submit Review"}
          <Send className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}