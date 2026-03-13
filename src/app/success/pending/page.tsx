"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) { router.replace("/"); return; }
    const interval = setInterval(() => {
      router.replace(`/success?session_id=${sessionId}`);
    }, 2000);
    return () => clearInterval(interval);
  }, [sessionId, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
        <p className="text-gray-600 text-sm">Zahlung wird bestätigt…</p>
      </div>
    </main>
  );
}

export default function PendingPage() {
  return (
    <Suspense>
      <PendingContent />
    </Suspense>
  );
}