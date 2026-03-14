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

    async function handleAuth() {
      // Clear any stale local session so its invalid refresh token doesn't
      // conflict with the new magic-link session we're about to set.
      await supabase.auth.signOut({ scope: "local" });

      // PKCE flow — code in query params (admin-generated links use this)
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        router.replace(error ? "/dashboard/login?error=link_expired" : next);
        return;
      }

      // Implicit flow — tokens in hash fragment
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        router.replace(error ? "/dashboard/login?error=link_expired" : next);
        return;
      }

      router.replace("/dashboard/login?error=link_expired");
    }

    handleAuth();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
    </main>
  );
}