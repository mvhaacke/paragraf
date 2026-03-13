"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle } from "lucide-react";
import { DeadlineBadge } from "@/components/DeadlineBadge";
import { DocumentPreview } from "@/components/DocumentPreview";
import { TriageResult } from "@/types";

export default function TriagePage() {
  const router = useRouter();
  const [triage, setTriage] = useState<TriageResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("triage");
    if (!raw) { router.replace("/"); return; }
    const parsed = JSON.parse(raw) as TriageResult;
    if (parsed.deadline) parsed.deadline = new Date(parsed.deadline);
    setTriage(parsed);
  }, [router]);

  if (!triage) return null;

  if (!triage.isInScope) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
        <div className="w-full max-w-lg space-y-6">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-amber-900">Außerhalb unseres Bereichs</p>
              <p className="text-sm text-amber-700 mt-1">{triage.outOfScopeMessage}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Für diesen Fall empfehlen wir den{" "}
            <strong>Mieterverein</strong> oder einen Rechtsanwalt.
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-gray-500 hover:text-gray-900 underline"
          >
            Anderes Dokument hochladen
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-16">
      <div className="w-full max-w-lg mx-auto space-y-8">
        {/* Document title */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
            Ihr Dokument
          </p>
          <h1 className="text-xl font-semibold text-gray-900">{triage.documentTitle}</h1>
        </div>

        {/* Deadline — prominent */}
        {triage.deadline && triage.daysRemaining !== null && (
          <DeadlineBadge
            daysRemaining={triage.daysRemaining}
            deadline={triage.deadline}
          />
        )}

        {/* Summary */}
        <p className="text-gray-700 leading-relaxed">{triage.summary}</p>

        {/* Consequence — once only */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-sm font-medium text-gray-800">Wenn Sie nichts tun:</p>
          <p className="text-sm text-gray-600 mt-1">{triage.consequence}</p>
        </div>

        {/* Recommendation */}
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-gray-900">{triage.recommendation}</p>
            <p className="text-sm text-gray-500 mt-1">{triage.recommendationReasoning}</p>
          </div>
        </div>

        {/* Document preview — the conversion moment */}
        <DocumentPreview
          triage={triage}
          onUnlock={() => router.push("/action")}
        />

        <p className="text-center text-xs text-gray-400">
          {triage.feeType === "flat"
            ? `Einmalige Gebühr: €${triage.feeAmount} — kein Abo, keine versteckten Kosten.`
            : "Erfolgshonorar: 25 % nur bei bestätigter Zahlung."}
        </p>
      </div>
    </main>
  );
}