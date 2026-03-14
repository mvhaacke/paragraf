import { NextRequest, NextResponse } from "next/server";
import { analyseDocument } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60; // two sequential AI calls can take up to ~40s

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Keine Datei gefunden." }, { status: 400 });
  }

  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: "Datei zu groß." }, { status: 400 });
  }

  const allowed = ["application/pdf", "image/jpeg", "image/png"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Ungültiges Dateiformat." }, { status: 400 });
  }

  let triage;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    triage = await analyseDocument(buffer, file.type);
  } catch (err) {
    const message = err instanceof Error ? err.message : null;
    return NextResponse.json(
      { error: message ?? "Dokument konnte nicht analysiert werden. Bitte versuchen Sie es erneut." },
      { status: 502 }
    );
  }

  // Temporary upload ID — links the triage result to this session (no DB until payment)
  const uploadId = crypto.randomUUID();

  return NextResponse.json({ triage, uploadId });
}