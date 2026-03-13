"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      setError("Bitte laden Sie ein PDF, JPG oder PNG hoch.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("Datei zu groß. Maximum 20 MB.");
      return;
    }

    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Fehler beim Hochladen. Bitte versuchen Sie es erneut.");
      setIsLoading(false);
      return;
    }

    // Store triage result in sessionStorage so /triage can read it without a DB round-trip
    sessionStorage.setItem("triage", JSON.stringify(data.triage));
    sessionStorage.setItem("uploadId", data.uploadId);
    router.push("/triage");
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-2">
          Paragraf
        </h1>
        <p className="text-gray-500 mb-10 text-base leading-relaxed">
          Laden Sie Ihr Rechtsdokument hoch — wir erklären Ihnen in einfacher
          Sprache, was zu tun ist, und erstellen die nötige Antwort für Sie.
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          disabled={isLoading}
          className={`w-full border-2 border-dashed rounded-xl p-12 flex flex-col items-center gap-3 transition-colors cursor-pointer
            ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"}
            ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {isLoading ? (
            <>
              <div className="w-8 h-8 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Dokument wird analysiert…</span>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Dokument hier ablegen oder klicken
              </span>
              <span className="text-xs text-gray-400">PDF, JPG, PNG — max. 20 MB</span>
            </>
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {error && (
          <div className="mt-4 flex items-start gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="mt-10 border-t border-gray-100 pt-8">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
            Unterstützte Fälle
          </p>
          <ul className="space-y-2">
            {[
              ["Mahnbescheid", "Gerichtlicher Zahlungsbefehl"],
              ["Inkassoschreiben", "Forderungsschreiben von Inkassobüros"],
            ].map(([title, desc]) => (
              <li key={title} className="flex items-start gap-2 text-sm">
                <FileText className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                <span>
                  <span className="font-medium text-gray-700">{title}</span>
                  <span className="text-gray-400"> — {desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}