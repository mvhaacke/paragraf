import { createServerComponentClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Clock, ChevronRight } from "lucide-react";

type RawCase = Case & { document_title?: string; case_type?: string; created_at?: string };
import { Case } from "@/types";

const CASE_TYPE_LABELS: Record<string, string> = {
  mahnbescheid: "Mahnbescheid",
  vollstreckungsbescheid: "Vollstreckungsbescheid",
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
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Paragraf</h1>
          <div className="flex items-center justify-between mt-6">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Ihre Fälle</p>
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              + Neues Dokument
            </Link>
          </div>
        </div>

        {!cases || cases.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Noch keine Fälle vorhanden.
          </div>
        ) : (
          <ul className="space-y-3">
            {(cases as RawCase[]).map((c) => {
              const caseType = c.case_type ?? c.caseType;
              const title = c.document_title ?? c.documentTitle;
              const deadline = c.deadline;
              return (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/${c.id}`}
                    className="flex items-center gap-4 border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-gray-300 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-400 mb-0.5">
                        {CASE_TYPE_LABELS[caseType] ?? caseType}
                      </p>
                      <p className="font-medium text-gray-900 truncate">
                        {title}
                      </p>
                    </div>
                    {deadline && (
                      <span className="flex items-center gap-1 text-xs text-amber-600 shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(deadline).toLocaleDateString("de-DE")}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
