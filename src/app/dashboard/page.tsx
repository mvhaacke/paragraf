import { createServerComponentClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Clock, ChevronRight } from "lucide-react";
import { Case } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  triage: "Analyse",
  pending_payment: "Zahlung ausstehend",
  document_ready: "Dokument bereit",
  filed: "Eingereicht",
  hearing_scheduled: "Termin vereinbart",
  closed: "Abgeschlossen",
};

const CASE_TYPE_LABELS: Record<string, string> = {
  mahnbescheid: "Mahnbescheid",
  consumer_debt: "Inkassoforderung",
  rental_deposit: "Mietkaution",
  wrongful_dismissal: "Kündigung",
};

export default async function DashboardPage() {
  const supabase = await createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: cases } = await supabase
    .from("cases")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <div className="max-w-lg mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Ihre Fälle</h1>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            + Neues Dokument
          </Link>
        </div>

        {!cases || cases.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Noch keine Fälle vorhanden.
          </div>
        ) : (
          <ul className="space-y-3">
            {(cases as Case[]).map((c) => (
              <li key={c.id}>
                <Link
                  href={`/dashboard/${c.id}`}
                  className="flex items-center gap-4 border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-gray-300 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {c.documentTitle}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {CASE_TYPE_LABELS[c.caseType] ?? c.caseType}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-gray-400">
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                    {c.deadline && (
                      <span className="flex items-center gap-1 text-xs text-amber-600">
                        <Clock className="w-3 h-3" />
                        {new Date(c.deadline).toLocaleDateString("de-DE")}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}