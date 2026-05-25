"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Could not log out", {
        description: error.message,
      });
      return;
    }

    toast.success("Logged out");
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      type="button"
      onClick={handleLogout}
      variant="outline"
      className="rounded-xl border-slate-200 font-bold"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Log out
    </Button>
  );
}
