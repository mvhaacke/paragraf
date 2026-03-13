import { createClient } from "@supabase/supabase-js";
import { createServerComponentClient } from "@/lib/supabase";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, FileText, CheckCircle, Circle } from "lucide-react";
import { Case } from "@/types";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STATUS_STEPS = [
  { status: "pending_payment",   label: "Zahlung bestätigt" },
  { status: "document_ready",    label: "Dokument erstellt" },
  { status: "filed",             label: "Eingereicht" },
  { status: "hearing_scheduled", label: "Termin vereinbart" },
  { status: "closed",            label: "Abgeschlossen" },
];

const NEXT_STEP: Partial<Record<string, string>> = {
  document_ready:
    "Laden Sie Ihr Dokument herunter, drucken Sie es aus, und senden Sie es per Einschreiben mit Rückschein an das zuständige Gericht. Die genaue Adresse finden Sie im Dokument.",
  filed:
    "Das Gericht wird den Widerspruch bearbeiten. Der Gläubiger hat nun die Möglichkeit, Klage einzureichen. Sie erhalten weitere Post vom Gericht.",
  hearing_scheduled:
    "Bereiten Sie sich auf den Gerichtstermin vor. Bringen Sie alle relevanten Dokumente mit.",
};

interface Props {
  params: Promise<{ caseId: string }>;
}

export default async function CaseDetailPage({ params }: Props) {
  const { caseId } = await params;

  const supabase = await createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/dashboard/login`);

  // RLS ensures users only see their own cases
  const { data: caseRow } = await supabase
    .from("cases")
    .select("*")
    .eq("id", caseId)
    .single();

  if (!caseRow) notFound();

  const c = caseRow as Case;
  const currentStep = STATUS_STEPS.findIndex((s) => s.status === c.status);

  const { data: documents } = await supabaseAdmin
    .from("documents")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  const deadline = c.deadline ? new Date(c.deadline) : null;
  const daysLeft = deadline
    ? Math.ceil((deadline.getTime() - Date.now()) / 86_400_000)
    : null;

  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <div className="max-w-lg mx-auto space-y-8">

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Alle Fälle
        </Link>

        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-xl font-semibold text-gray-900">{c.documentTitle}</h1>
          {deadline && daysLeft !== null && (
            <div className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg
              ${daysLeft <= 0 ? "bg-gray-100 text-gray-500" :
                daysLeft <= 5 ? "bg-red-50 text-red-700" :
                daysLeft <= 10 ? "bg-amber-50 text-amber-700" :
                "bg-blue-50 text-blue-700"}`}
            >
              <Clock className="w-4 h-4" />
              {daysLeft > 0
                ? `${daysLeft} ${daysLeft === 1 ? "Tag" : "Tage"} verbleibend — Frist: ${deadline.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}`
                : `Frist abgelaufen (${deadline.toLocaleDateString("de-DE")})`}
            </div>
          )}
        </div>

        {/* Progress timeline */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
            Fallverlauf
          </p>
          <ol className="space-y-3">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <li key={step.status} className="flex items-center gap-3">
                  {done
                    ? <CheckCircle className={`w-5 h-5 shrink-0 ${active ? "text-gray-900" : "text-gray-300"}`} />
                    : <Circle className="w-5 h-5 shrink-0 text-gray-200" />
                  }
                  <span className={`text-sm ${active ? "font-semibold text-gray-900" : done ? "text-gray-400 line-through" : "text-gray-300"}`}>
                    {step.label}
                  </span>
                  {active && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full ml-auto">
                      Aktuell
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Next step guidance */}
        {NEXT_STEP[c.status] && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-1.5">
            <p className="text-sm font-medium text-gray-800">Nächster Schritt</p>
            <p className="text-sm text-gray-600 leading-relaxed">{NEXT_STEP[c.status]}</p>
          </div>
        )}

        {/* Documents */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
            Dokumente
          </p>
          {!documents || documents.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              {c.status === "pending_payment"
                ? "Dokument wird nach Zahlungsbestätigung erstellt."
                : "Ihr Dokument wird vorbereitet…"}
            </p>
          ) : (
            <ul className="space-y-2">
              {documents.map((doc: { id: string; file_name: string; kind: string }) => (
                <li key={doc.id} className="flex items-center gap-3 border border-gray-100 rounded-xl p-4">
                  <FileText className="w-5 h-5 text-gray-300 shrink-0" />
                  <span className="text-sm text-gray-700 flex-1 truncate">{doc.file_name}</span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {doc.kind === "generated" ? "Erstellt" : "Hochgeladen"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </main>
  );
}