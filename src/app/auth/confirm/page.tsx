"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

// Handles both auth flows Supabase may use:
//   Implicit flow — tokens arrive in the URL hash (#access_token=...)
//   PKCE flow     — code arrives as a query param (?code=...)
export default function AuthConfirmPage() {
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.slice(1));

    const next = searchParams.get("next") ?? hashParams.get("next") ?? "/dashboard";
    const supabase = createClient();

    // Implicit flow — tokens in hash
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    if (accessToken && refreshToken) {
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => {
          router.replace(error ? "/dashboard/login?error=link_expired" : next);
        });
      return;
    }

    // PKCE flow — code in query params
    const code = searchParams.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        router.replace(error ? "/dashboard/login?error=link_expired" : next);
      });
      return;
    }

    router.replace("/dashboard/login?error=link_expired");
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
    </main>
  );
}