"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewAssessmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const formData = new FormData(e.currentTarget);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      alert("You must be logged in to create an assessment.");
      return;
    }

    const title = String(formData.get("title") || "").trim();
    const promptText = String(formData.get("prompt_text") || "").trim();

    const requiredKeywords = keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const { data, error } = await supabase
      .from("assessments")
      .insert({
        employer_id: user.id,
        title,
        prompt_text: promptText,
        required_keywords: requiredKeywords,
        questions: [],
        is_active: true,
        priority: "normal",
      })
      .select("id")
      .single();

    setLoading(false);

    if (error) {
      console.error("Assessment creation error:", error);
      alert(error.message || "Error creating assessment");
      return;
    }

    router.push(`/test/${data.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Create New Vetting Assessment
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Assessment Title</label>
              <Input
                name="title"
                placeholder="e.g., HVAC Final Walkthrough"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Job Description / AI Instructions
              </label>
              <Textarea
                name="prompt_text"
                placeholder="Explain what the candidate should inspect, record, and explain..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-600">
                Required Tools & Keywords
              </label>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., Voltage Tester, Grounding Wire, Amperage"
              />
              <p className="text-xs italic text-slate-500">
                Comma-separated terms the AI should check for.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Creating..." : "Launch Assessment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
