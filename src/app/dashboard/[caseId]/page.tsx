import { createServerComponentClient } from "@/lib/supabase";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, FileText, Upload } from "lucide-react";
import { DeadlineBadge } from "@/components/DeadlineBadge";
import { getCaseTemplate } from "@/lib/templates";
import { TriageResult } from "@/types";

interface Props {
  params: Promise<{ caseId: string }>;
}

export default async function CaseDetailPage({ params }: Props) {
  const { caseId } = await params;

  const supabase = await createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/dashboard/login");

  const { data: row } = await supabase
    .from("cases")
    .select("*, documents(*)")
    .eq("id", caseId)
    .single();

  if (!row) notFound();

  // DB columns are snake_case; triage_result was stored as a JS object (camelCase keys)
  const triage = row.triage_result as TriageResult;
  const tmpl = getCaseTemplate(triage);

  const deadline = row.deadline ? new Date(row.deadline) : null;
  const daysRemaining = deadline
    ? Math.ceil((deadline.getTime() - Date.now()) / 86_400_000)
    : null;

  const documents: Array<{ id: string; file_name: string; kind: string }> =
    row.documents ?? [];
  const generatedDoc = documents.find((d) => d.kind === "generated");

  // Address block for sending instructions
  const addressLines: string[] = (triage.caseType === "mahnbescheid" || triage.caseType === "vollstreckungsbescheid")
    ? [triage.courtName, ...(triage.courtAddress?.split("\n") ?? [])].filter(Boolean) as string[]
    : [triage.creditorName, ...(triage.courtAddress?.split("\n") ?? [])].filter(Boolean) as string[];

  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <div className="max-w-lg mx-auto space-y-10">

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Alle Fälle
        </Link>

        {/* Header */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Ihr Fall</p>
          <h1 className="text-xl font-semibold text-gray-900">{row.document_title}</h1>
          {deadline && daysRemaining !== null && (
            <DeadlineBadge deadline={deadline} daysRemaining={daysRemaining} />
          )}
        </div>

        {/* Documents */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Ihr Dokument
          </p>
          {generatedDoc ? (
            <a
              href={`/api/document/${generatedDoc.id}`}
              className="flex items-center gap-3 w-full border border-gray-200 rounded-xl p-4 hover:border-gray-400 hover:bg-gray-50 transition-colors group"
            >
              <FileText className="w-5 h-5 text-gray-400 shrink-0 group-hover:text-gray-700" />
              <span className="text-sm text-gray-700 flex-1">{generatedDoc.file_name}</span>
              <Download className="w-4 h-4 text-gray-400 shrink-0 group-hover:text-gray-700" />
            </a>
          ) : (
            <div className="flex items-center gap-3 border border-dashed border-gray-200 rounded-xl p-4">
              <FileText className="w-5 h-5 text-gray-300 shrink-0" />
              <span className="text-sm text-gray-400">
                {tmpl.documentLabel} — wird vorbereitet
              </span>
            </div>
          )}
        </div>

        {/* Sending instructions */}
        <div className="space-y-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            So senden Sie es ab
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            Gehen Sie zur Post und versenden Sie das Dokument als{" "}
            <span className="font-medium text-gray-900">Einschreiben mit Rückschein</span>.
            Bewahren Sie den Einlieferungsbeleg auf — er ist Ihr einziger Nachweis des
            fristgerechten Versands.
          </p>
          {addressLines.length > 0 && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 font-mono text-sm text-gray-700 space-y-0.5">
              <p className="text-xs font-sans font-medium text-gray-400 uppercase tracking-wider mb-2">
                Empfänger
              </p>
              {addressLines.map((line, i) => (
                <p key={i} className={i === 0 ? "font-semibold text-gray-900" : ""}>{line}</p>
              ))}
              {triage.caseReference && (
                <p className="pt-2 text-xs text-gray-500">
                  Aktenzeichen auf dem Umschlag vermerken: <span className="font-medium">{triage.caseReference}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* What happens next */}
        {tmpl.whatHappensNext && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Was passiert jetzt?
            </p>
            {tmpl.whatHappensNext.split("\n\n").map((para, i) => (
              <p key={i} className="text-sm text-gray-600 leading-relaxed">{para}</p>
            ))}
          </div>
        )}

        {/* Re-upload stub */}
        <div className="border-t border-gray-100 pt-8 space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Neue Antwort erhalten?
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Wenn Sie ein neues Schreiben erhalten haben, laden Sie es hier hoch.
            Wir erklären Ihnen, was es bedeutet.
          </p>
          <button
            disabled
            className="flex items-center gap-2 border border-dashed border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-400 cursor-not-allowed w-full"
          >
            <Upload className="w-4 h-4" />
            Schreiben hochladen — demnächst verfügbar
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">
          Dieses Angebot ersetzt keine individuelle Rechtsberatung.
        </p>

      </div>
    </main>
  );
}
