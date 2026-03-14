"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
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

  // Mahnbescheid with an expired deadline: we cannot help — the Widerspruchsfrist
  // is a hard legal deadline. Consumer debt deadlines have no legal force, so we
  // never block on them.
  const isCourtDocument =
    triage.caseType === "mahnbescheid" || triage.caseType === "vollstreckungsbescheid";

  const isExpired =
    isCourtDocument &&
    triage.daysRemaining !== null &&
    triage.daysRemaining < 0;

  // For consumer debt, suppress the deadline badge if the stated deadline has passed
  // (it was never legally binding, showing "expired" would cause unnecessary alarm).
  const showDeadlineBadge =
    triage.deadline !== null &&
    triage.daysRemaining !== null &&
    (isCourtDocument || triage.daysRemaining >= 0);

  // Inkasso letters often state no deadline — explain this rather than showing nothing.
  const showNoDeadlineNote =
    triage.caseType === "consumer_debt" && triage.deadline === null;

  return (
    <main className="min-h-screen bg-white px-4 py-16">
      <div className="w-full max-w-lg mx-auto space-y-10">

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Anderes Dokument hochladen
        </Link>

        {/* 1. Document title + deadline */}
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              Ihr Dokument
            </p>
            <h1 className="text-xl font-semibold text-gray-900">{triage.documentTitle}</h1>
          </div>
          {showDeadlineBadge && (
            <DeadlineBadge
              daysRemaining={triage.daysRemaining!}
              deadline={triage.deadline!}
            />
          )}
          {showNoDeadlineNote && (
            <p className="text-sm text-gray-500">
              Inkassofristen sind keine gesetzlichen Fristen — sie haben keine rechtliche Bindungswirkung.
            </p>
          )}
        </div>

        {/* 2. What is this */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Was ist das?
          </p>
          <p className="text-gray-700 leading-relaxed">{tmpl.whatIsThis}</p>
        </div>

        {/* 3 + 4. Consequence and options — only relevant if deadline hasn't passed */}
        {!isExpired && (
          <>
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
              <p className="text-sm font-medium text-gray-800 mb-1">Wenn Sie nichts tun</p>
              <p className="text-sm text-gray-600 leading-relaxed">{tmpl.consequence}</p>
            </div>

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
                  {tmpl.optionBStat && (
                    <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-1.5 mt-0.5">
                      {tmpl.optionBStat}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100" />
          <p className="text-xs text-gray-400 whitespace-nowrap">
            {isExpired ? "Was jetzt?" : "Wobei wir helfen können"}
          </p>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* 5. Offer — or expired state */}
        {isExpired ? (
          <div className="space-y-3">
            {triage.caseType === "vollstreckungsbescheid" ? (
              <>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Die Einspruchsfrist nach §700 ZPO ist abgelaufen. Der Vollstreckungsbescheid
                  ist damit vollstreckbar — der Gläubiger kann Zwangsvollstreckungsmaßnahmen
                  einleiten.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  In diesem Stadium empfehlen wir, sich direkt an einen Rechtsanwalt zu wenden.
                  Eine Wiedereinsetzung in den vorigen Stand ist nur unter engen gesetzlichen
                  Voraussetzungen möglich (§233 ZPO).
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Die Widerspruchsfrist ist abgelaufen. Der Mahnbescheid kann damit
                  rechtskräftig geworden sein — das bedeutet, der Gläubiger kann
                  einen Vollstreckungsbescheid beantragen.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  In diesem Stadium empfehlen wir, sich direkt an einen Rechtsanwalt
                  oder eine Verbraucherrechtsberatung zu wenden. Manchmal ist auch
                  nach Fristablauf noch eine Wiedereinsetzung möglich.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">{tmpl.ourOffer}</p>
            <DocumentPreview
              triage={triage}
              tmpl={tmpl}
              onUnlock={() => router.push("/action")}
            />
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-400">
          Dieses Angebot ersetzt keine individuelle Rechtsberatung.
        </p>

      </div>
    </main>
  );
}