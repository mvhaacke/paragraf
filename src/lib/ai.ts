import { CaseType, TriageResult } from "@/types";

/**
 * Analyses an uploaded document and returns structured triage data.
 * STUB — replace with real Claude / OpenAI call in Phase 1.
 */
export async function analyseDocument(
  _fileBuffer: Buffer,
  _mimeType: string
): Promise<TriageResult> {
  // Simulate processing delay
  await new Promise((r) => setTimeout(r, 800));

  // Hardcoded stub result for a Mahnbescheid
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 11);

  return {
    caseType: "mahnbescheid" as CaseType,
    documentTitle: "Mahnbescheid vom Amtsgericht Hagen",
    deadline,
    daysRemaining: 11,
    summary:
      "Sie haben einen gerichtlichen Mahnbescheid erhalten. Der Gläubiger behauptet, Sie schulden €1.240 aus einem Kaufvertrag.",
    consequence:
      "Wenn Sie nichts tun, wird der Mahnbescheid rechtskräftig und der Gläubiger kann direkt pfänden.",
    recommendation: "Legen Sie sofort Widerspruch ein.",
    recommendationReasoning:
      "Der Widerspruch stoppt das Verfahren ohne Begründung — Sie müssen jetzt nicht beweisen, dass Sie recht haben.",
    feeType: "flat",
    feeAmount: 29,
    isInScope: true,
    caseReference: "12 B 4821/25",
    courtName: "Amtsgericht Hagen",
    courtAddress: "Heinitzstraße 42\n44623 Herne",
    claimedAmount: "1.240,00 €",
    creditorName: "Mustermann GmbH",
  };
}

/**
 * Generates the court-ready response document as a PDF buffer.
 * STUB — replace with real document generation in Phase 1.
 */
export async function generateResponseDocument(
  _triageResult: TriageResult,
  _additionalFacts: Record<string, string>
): Promise<Buffer> {
  await new Promise((r) => setTimeout(r, 1200));
  // Return a placeholder PDF (1-byte buffer for now)
  return Buffer.from("PDF_PLACEHOLDER");
}