import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-xl items-center">
        <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 shadow-2xl shadow-blue-950/40 backdrop-blur-xl">
          <div className="h-14 w-14 animate-pulse rounded-2xl bg-white/10" />
          <div className="mt-8 h-4 w-32 animate-pulse rounded bg-white/10" />
          <div className="mt-4 h-10 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="mt-8 h-14 w-full animate-pulse rounded-2xl bg-white/10" />
        </div>
      </div>
    </main>
  );
}
