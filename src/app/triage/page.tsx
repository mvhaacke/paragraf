"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { DeadlineBadge } from "@/components/DeadlineBadge";
import { DocumentPreview } from "@/components/DocumentPreview";
import { getCaseTemplate } from "@/lib/templates";
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

  // Out of scope
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
            Für diesen Fall empfehlen wir den <strong>Mieterverein</strong> oder einen Rechtsanwalt.
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

  const tmpl = getCaseTemplate(triage);

  return (
    <main className="min-h-screen bg-white px-4 py-16">
      <div className="w-full max-w-lg mx-auto space-y-10">

        {/* 1. Document title + deadline */}
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              Ihr Dokument
            </p>
            <h1 className="text-xl font-semibold text-gray-900">{triage.documentTitle}</h1>
          </div>
          {triage.deadline && triage.daysRemaining !== null && (
            <DeadlineBadge
              daysRemaining={triage.daysRemaining}
              deadline={triage.deadline}
            />
          )}
        </div>

        {/* 2. What is this */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Was ist das?
          </p>
          <p className="text-gray-700 leading-relaxed">{tmpl.whatIsThis}</p>
        </div>

        {/* 3. Consequence — stated once, never repeated */}
        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
          <p className="text-sm font-medium text-gray-800 mb-1">Wenn Sie nichts tun</p>
          <p className="text-sm text-gray-600 leading-relaxed">{tmpl.consequence}</p>
        </div>

        {/* 4. Options — neutral, no recommendation */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Ihre Optionen
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-100 rounded-xl p-4 space-y-1.5">
              <p className="text-sm font-semibold text-gray-900">{tmpl.optionALabel}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{tmpl.optionAExplanation}</p>
            </div>
            <div className="border border-gray-200 rounded-xl p-4 space-y-1.5">
              <p className="text-sm font-semibold text-gray-900">{tmpl.optionBLabel}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{tmpl.optionBExplanation}</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100" />
          <p className="text-xs text-gray-400 whitespace-nowrap">Wobei wir helfen können</p>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* 5. Our offer + document preview */}
        <div className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">{tmpl.ourOffer}</p>
          <DocumentPreview
            triage={triage}
            tmpl={tmpl}
            onUnlock={() => router.push("/action")}
          />
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-400">
          Dieses Angebot ersetzt keine individuelle Rechtsberatung.
        </p>

      </div>
    </main>
  );
}