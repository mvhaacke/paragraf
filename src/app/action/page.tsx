"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { DeadlineBadge } from "@/components/DeadlineBadge";
import { getCaseTemplate } from "@/lib/templates";
import { TriageResult } from "@/types";

export default function ActionPage() {
  const router = useRouter();
  const [triage, setTriage] = useState<TriageResult | null>(null);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("triage");
    if (!raw) { router.replace("/"); return; }
    const parsed = JSON.parse(raw) as TriageResult;
    if (parsed.deadline) parsed.deadline = new Date(parsed.deadline);
    setTriage(parsed);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!triage) return;
    setIsSubmitting(true);
    setError(null);

    const uploadId = sessionStorage.getItem("uploadId");
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, uploadId, triage }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Fehler. Bitte versuchen Sie es erneut.");
      setIsSubmitting(false);
      return;
    }

    window.location.href = data.checkoutUrl;
  }

  if (!triage) return null;

  const tmpl = getCaseTemplate(triage);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <div className="w-full max-w-sm space-y-6">

        <div>
          <h1 className="text-xl font-semibold text-gray-900">{tmpl.documentLabel}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Mit Ihren Daten ausgefüllt, adressiert, druckfertig.
          </p>
        </div>

        {triage.deadline && triage.daysRemaining !== null && (
          <DeadlineBadge
            daysRemaining={triage.daysRemaining}
            deadline={triage.deadline}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              E-Mail-Adresse
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihre@email.de"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_white] [&:-webkit-autofill]:[color:black]"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Ihr Konto wird automatisch erstellt. Kein Passwort nötig.
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-xl py-4 font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Freischalten — €{triage.feeAmount}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Sichere Zahlung über Stripe · Kein Abo · Dieses Angebot ersetzt keine individuelle Rechtsberatung.
        </p>

      </div>
    </main>
  );
}
