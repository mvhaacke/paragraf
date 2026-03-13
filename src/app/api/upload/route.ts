import { NextRequest, NextResponse } from "next/server";
import { analyseDocument } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Keine Datei gefunden." }, { status: 400 });
  }

  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: "Datei zu groß." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const triage = await analyseDocument(buffer, file.type);

  // Generate a temporary ID for this upload session (no DB needed before payment)
  const uploadId = crypto.randomUUID();

  return NextResponse.json({ triage, uploadId });
}