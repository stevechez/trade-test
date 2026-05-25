"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase"; // Ensure this is imported
import { toast } from "sonner"; // Ensure this is imported
import {
  ArrowRight,
  FileText,
  Search,
  X,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LogoutButton from "@/components/LogoutButton";

export default function DashboardClient({
  initialSubmissions,
}: {
  initialSubmissions: any[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();

  const filteredSubmissions = initialSubmissions.filter((sub) => {
    const title = sub.assessments?.title?.toLowerCase() || "";
    const email = sub.candidate_email?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return title.includes(search) || email.includes(search);
  });

  const handleMarkReviewed = async (id: string, currentMetadata: any) => {
    const { error } = await supabase
      .from("verdicts")
      .update({
        metadata: {
          ...currentMetadata,
          feedback_reviewed: true,
        },
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Feedback marked as reviewed");
      // For the prototype, a simple refresh will update the UI
      window.location.reload();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in slide-in-from-bottom-2 duration-500">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Project Command
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Managing {initialSubmissions.length} trade verdicts.
          </p>
        </div>
        <LogoutButton />

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <Input
            placeholder="Search property or trade..."
            className="pl-10 pr-10 py-6 rounded-2xl border-slate-200 focus:ring-blue-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
            >
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Responsive Card Stack */}
      <div className="w-full space-y-4">
        {filteredSubmissions.map((sub) => {
          // Define logic inside the map so 'sub' is accessible
          const isNewFeedback =
            sub.metadata?.contractor_test_questions &&
            !sub.metadata?.feedback_reviewed;
          const isReviewedFeedback =
            sub.metadata?.contractor_test_questions &&
            sub.metadata?.feedback_reviewed;

          return (
            <div
              key={sub.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-200 transition-colors group"
            >
              <div className="flex items-center gap-4 md:w-1/4">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Logged
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={
                      sub.status === "COMPLETED" ? "default" : "secondary"
                    }
                    className="text-[10px] uppercase"
                  >
                    {sub.status}
                  </Badge>

                  {/* FEEDBACK DIALOG */}
                  {(isNewFeedback || isReviewedFeedback) && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors cursor-pointer 
                          ${isNewFeedback ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse" : "bg-slate-50 text-slate-500 border-slate-200"}`}
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase tracking-tighter">
                            {isNewFeedback
                              ? "Feedback Received"
                              : "Feedback Reviewed"}
                          </span>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[525px] rounded-3xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
                            <MessageSquare className="text-blue-600" />
                            Contractor Alpha Test
                          </DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 space-y-4">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                              Property
                            </p>
                            <p className="text-sm font-bold text-slate-900">
                              {sub.assessments?.title || "Residential Site"}
                            </p>
                          </div>
                          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 italic text-slate-700 whitespace-pre-wrap leading-relaxed shadow-inner">
                            {sub.metadata.contractor_test_questions}
                          </div>

                          {isNewFeedback && (
                            <Button
                              onClick={() =>
                                handleMarkReviewed(sub.id, sub.metadata)
                              }
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold py-6 shadow-lg"
                            >
                              Mark as Reviewed
                            </Button>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <h4 className="text-lg font-black text-slate-900 leading-tight">
                  {sub.assessments?.title || "General Compliance Audit"}
                </h4>
                <p className="text-slate-500 text-sm mt-1">
                  {sub.candidate_email}
                </p>
              </div>

              <div className="md:w-1/5 flex justify-end">
                <Button
                  asChild
                  className="w-full md:w-auto bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold px-6"
                >
                  <Link
                    href={`/dashboard/review/${sub.id}`}
                    className="flex items-center gap-2"
                  >
                    View Verdict <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="mt-20 border-t border-slate-100 py-10 no-print">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2 font-medium text-slate-900">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            Dunn Strategic Consulting LLC
          </div>
          <div className="flex gap-8 font-bold">
            <Link href="/privacy" className="hover:text-blue-600">
              Privacy
            </Link>
            <Link
              href="mailto:support@siteverdict.online"
              className="hover:text-blue-600"
            >
              Support
            </Link>
            <span className="text-slate-300 font-normal">
              © 2026 SiteVerdict
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
