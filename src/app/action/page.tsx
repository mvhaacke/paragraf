"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { DeadlineBadge } from "@/components/DeadlineBadge";
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

    // Redirect to Stripe Checkout
    window.location.href = data.checkoutUrl;
  }

  if (!triage) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <div className="w-full max-w-lg space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dokument erstellen</h1>
          <p className="text-sm text-gray-500 mt-1">
            Nach der Zahlung erhalten Sie Ihr fertiges Dokument mit genauer
            Einreichungsanleitung.
          </p>
        </div>

        {triage.deadline && triage.daysRemaining !== null && (
          <DeadlineBadge
            daysRemaining={triage.daysRemaining}
            deadline={triage.deadline}
          />
        )}

        {/* What they get */}
        <div className="border border-gray-100 rounded-xl p-5 space-y-3">
          <p className="text-sm font-medium text-gray-700">Sie erhalten:</p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
              Ausgefülltes Widerspruchsformular (druckfertig)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
              Schritt-für-Schritt Einreichungsanleitung
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
              Fallübersicht im Dashboard — inklusive nächster Schritte
            </li>
          </ul>
        </div>

        {/* Email + pay form */}
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
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Ihr Konto wird automatisch erstellt. Kein Passwort nötig.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-xl py-4 font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Jetzt bezahlen — €{triage.feeAmount}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Sichere Zahlung über Stripe. Keine Kreditkartendaten werden bei uns gespeichert.
        </p>
      </div>
    </main>
  );
}