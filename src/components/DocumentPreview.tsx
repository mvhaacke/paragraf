import { Lock } from "lucide-react";
import { TriageResult } from "@/types";
import { CaseTemplate } from "@/lib/templates";

interface DocumentPreviewProps {
  triage: TriageResult;
  tmpl: CaseTemplate;
  onUnlock: () => void;
}

export function DocumentPreview({ triage, tmpl, onUnlock }: DocumentPreviewProps) {
  const today = new Date().toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const courtLines = triage.courtAddress?.split("\n") ?? [];

  return (
    <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-white">
      {/* Header — fully visible, shows real extracted data */}
      <div className="px-6 pt-6 pb-4 font-mono text-xs text-gray-700 space-y-4">
        <div className="text-gray-400 space-y-0.5">
          <p>Ihr Name</p>
          <p>Ihre Adresse</p>
        </div>

        {triage.courtName ? (
          <div className="space-y-0.5">
            <p className="font-semibold text-gray-800">{triage.courtName}</p>
            {courtLines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        ) : triage.creditorName ? (
          <p className="font-semibold text-gray-800">{triage.creditorName}</p>
        ) : null}

        <p className="text-gray-500">{today}</p>

        <div className="space-y-0.5">
          <p className="font-bold text-gray-900 text-sm">{tmpl.documentLabel}</p>
          {triage.caseReference && (
            <p>Aktenzeichen: {triage.caseReference}</p>
          )}
          {triage.claimedAmount && (
            <p>Forderungsbetrag: {triage.claimedAmount}</p>
          )}
        </div>

        <p>Sehr geehrte Damen und Herren,</p>
      </div>

      {/* Body — blurred */}
      <div className="relative px-6 pb-6">
        <div className="font-mono text-xs text-gray-700 select-none blur-sm pointer-events-none whitespace-pre-line leading-relaxed">
          {tmpl.blurredBody}
          {"\n\n"}Mit freundlichen Grüßen{"\n"}Ihr Name
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/60">
          <button
            onClick={onUnlock}
            className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Lock className="w-3.5 h-3.5" />
            Dokument freischalten — €{triage.feeAmount}
          </button>
          <p className="text-xs text-gray-400">
            Mit Ihren Daten ausgefüllt · druckfertig · {tmpl.documentLabel}
          </p>
        </div>
      </div>
    </div>
  );
}