"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  CheckCircle2,
  Construction,
  Loader2,
  Mail,
  Phone,
  User,
  Building2,
  Wrench,
  ArrowRight,
} from "lucide-react";

const tradeOptions = [
  { value: "general", label: "General Contractor" },
  { value: "electrical", label: "Electrical" },
  { value: "plumbing", label: "Plumbing" },
  { value: "hvac", label: "HVAC" },
  { value: "roofing", label: "Roofing" },
  { value: "other", label: "Other / Multi-trade" },
];

export default function LeadForm() {
  const [loading, setLoading] = useState(false);
  const [trade, setTrade] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      full_name: String(formData.get("full_name") || "").trim(),
      email: String(formData.get("email") || "")
        .trim()
        .toLowerCase(),
      company: String(formData.get("company") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      trade_type: trade,
      status: "beta_pending",
    };

    if (!payload.full_name || !payload.email || !trade) {
      toast.error("Please complete the required fields.");
      setLoading(false);
      return;
    }

    const toastId = toast.loading("Sending your pilot request...");

    const { error } = await supabase.from("leads").insert(payload);

    if (error) {
      console.error("Lead insert error:", error);

      toast.error("Unable to join the pilot", {
        id: toastId,
        description: error.message,
      });

      setLoading(false);
      return;
    }

    toast.success("Pilot request received", {
      id: toastId,
      description: "We’ll follow up with next steps for SiteVerdict access.",
    });

    setSubmittedEmail(payload.email);
    setSuccess(true);
    setTrade("");
    form.reset();
    setLoading(false);
  }

  if (success) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-[2rem] border border-emerald-200 bg-white p-8 shadow-2xl shadow-slate-200/60 dark:bg-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <p className="mt-7 text-xs font-black uppercase tracking-[0.14em] text-emerald-600">
            Request received
          </p>

          <h3 className="mt-2 text-3xl font-black tracking-[-0.015em] text-slate-950">
            You’re on the pilot list.
          </h3>

          <p className="mt-4 text-sm font-medium leading-7 text-slate-600">
            Thanks — we received your SiteVerdict pilot request for{" "}
            <span className="font-bold text-slate-950">{submittedEmail}</span>.
            We’ll follow up with next steps.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <p className="text-sm font-bold text-slate-800">
              What happens next?
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              We’ll review your request, confirm the best use case, and help you
              set up your first trade assessment workflow.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setSuccess(false)}
            className="mt-6 h-12 w-full rounded-2xl bg-slate-950 font-black text-white hover:bg-blue-600"
          >
            Submit another request
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/60 dark:border-white/10 dark:bg-white dark:shadow-blue-950/20 md:p-8"
      >
        <div className="mb-7 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <Construction className="h-6 w-6" />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">
              Trade Professional Pilot
            </p>
            <h3 className="mt-1 text-2xl font-black tracking-[-0.015em] text-slate-950">
              Request beta access
            </h3>
          </div>
        </div>

        <p className="mb-6 text-sm font-medium leading-7 text-slate-600">
          Join the SiteVerdict pilot and start reviewing subcontractor
          walkthroughs with video evidence, transcripts, and AI-assisted
          summaries.
        </p>

        <div className="space-y-3">
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              name="full_name"
              placeholder="Full name"
              required
              className="h-13 rounded-2xl border-slate-200 bg-slate-50 pl-11 text-slate-950 placeholder:text-slate-400 focus-visible:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              name="email"
              type="email"
              placeholder="Work email"
              required
              className="h-13 rounded-2xl border-slate-200 bg-slate-50 pl-11 text-slate-950 placeholder:text-slate-400 focus-visible:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              name="company"
              placeholder="Company name"
              className="h-13 rounded-2xl border-slate-200 bg-slate-50 pl-11 text-slate-950 placeholder:text-slate-400 focus-visible:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              name="phone"
              type="tel"
              placeholder="Phone number"
              className="h-13 rounded-2xl border-slate-200 bg-slate-50 pl-11 text-slate-950 placeholder:text-slate-400 focus-visible:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Wrench className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              required
              className="h-13 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-11 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Primary trade type</option>
              {tradeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              ▾
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="mt-5 h-14 w-full rounded-2xl bg-blue-600 text-base font-black text-white shadow-xl shadow-blue-100 transition-all hover:-translate-y-0.5 hover:bg-blue-700 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Sending request...
            </>
          ) : (
            "Request Pilot Access"
          )}
        </Button>

        <div className="mt-6 flex items-center justify-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <p className="text-[11px] font-semibold text-slate-400">
            No spam. Pilot access only.
          </p>
        </div>
      </form>
    </div>
  );
}
