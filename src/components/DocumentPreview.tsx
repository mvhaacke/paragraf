import { Lock } from "lucide-react";
import { TriageResult } from "@/types";

interface DocumentPreviewProps {
  triage: TriageResult;
  onUnlock: () => void;
}

const DOCUMENT_TITLES: Record<string, string> = {
  mahnbescheid: "Widerspruch gegen Mahnbescheid",
  consumer_debt: "Widerspruch und Bestreitungsschreiben",
  rental_deposit: "Aufforderungsschreiben Mietkaution",
  wrongful_dismissal: "Kündigungsschutzklage",
};

export function DocumentPreview({ triage, onUnlock }: DocumentPreviewProps) {
  const today = new Date().toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const docTitle = DOCUMENT_TITLES[triage.caseType] ?? "Rechtsdokument";
  const courtLines = triage.courtAddress?.split("\n") ?? [];

  return (
    <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-white">
      {/* Document header — fully visible */}
      <div className="px-6 pt-6 pb-4 font-mono text-xs text-gray-700 space-y-4">
        {/* Sender placeholder */}
        <div className="text-gray-400 space-y-0.5">
          <p>Max Mustermann</p>
          <p>Musterstraße 1, 12345 Berlin</p>
        </div>

        {/* Court address */}
        {triage.courtName && (
          <div className="space-y-0.5">
            <p className="font-semibold text-gray-800">{triage.courtName}</p>
            {courtLines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}

        <p className="text-gray-500">{today}</p>

        {/* Subject line — visible */}
        <div className="space-y-0.5">
          <p className="font-bold text-gray-900 text-sm">{docTitle}</p>
          {triage.caseReference && (
            <p>Aktenzeichen: {triage.caseReference}</p>
          )}
          {triage.claimedAmount && (
            <p>Forderungsbetrag: {triage.claimedAmount}</p>
          )}
        </div>

        {/* First visible line */}
        <p>Sehr geehrte Damen und Herren,</p>
      </div>

      {/* Body — blurred */}
      <div className="relative px-6 pb-6">
        <div className="space-y-2 font-mono text-xs text-gray-700 select-none blur-sm pointer-events-none">
          <p>
            hiermit lege ich fristgerecht Widerspruch gegen den oben
            genannten Mahnbescheid ein. Der geltend gemachte Anspruch
            wird dem Grunde und der Höhe nach vollumfänglich bestritten.
          </p>
          <p>
            Ich behalte mir vor, die Einwendungen gegen die Forderung
            im weiteren Verfahren im Einzelnen darzulegen und zu
            begründen. Eine Zahlung werde ich nicht leisten.
          </p>
          <p>
            Bitte bestätigen Sie den Eingang dieses Widerspruchs
            schriftlich. Für Rückfragen stehe ich unter den oben
            angegebenen Kontaktdaten zur Verfügung.
          </p>
          <p>Mit freundlichen Grüßen</p>
          <p>Max Mustermann</p>
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
            Mit Ihren Daten ausgefüllt, druckfertig
          </p>
        </div>
      </div>
    </div>
  );
}