"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { CheckCircle, Loader2 } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const justPaid = searchParams.get("success") === "1";
  const linkExpired = searchParams.get("error") === "link_expired";

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const supabase = createClient();
    const appUrl = window.location.origin;

    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${appUrl}/auth/confirm?next=/dashboard`,
        shouldCreateUser: false, // only existing users
      },
    });

    setSent(true);
    setIsLoading(false);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-6">
        {justPaid && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-green-900">Zahlung bestätigt</p>
              <p className="text-sm text-green-700 mt-0.5">
                Ihr Dokument wird vorbereitet. Geben Sie Ihre E-Mail ein, um
                auf Ihr Dashboard zuzugreifen.
              </p>
            </div>
          </div>
        )}

        {linkExpired && !justPaid && (
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            Der Link ist abgelaufen. Fordern Sie einen neuen an.
          </p>
        )}

        <div>
          <h1 className="text-xl font-semibold text-gray-900">Zum Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Wir senden Ihnen einen Anmeldelink an Ihre E-Mail-Adresse.
          </p>
        </div>

        {sent ? (
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-800">
              Link gesendet. Bitte prüfen Sie Ihr Postfach.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihre@email.de"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_white] [&:-webkit-autofill]:[color:black]"
            />
            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Anmeldelink senden"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function DashboardLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
