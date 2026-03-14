import { z } from "zod";
import { CaseType, TriageResult } from "@/types";

/**
 * Zod schema for LLM document extraction.
 *
 * When wiring up real Claude calls, pass this as a tool definition:
 *
 *   import { zodToJsonSchema } from "zod-to-json-schema";
 *
 *   const response = await anthropic.messages.create({
 *     model: "claude-opus-4-6",
 *     tools: [{
 *       name: "extract_document",
 *       description: "Extract structured data from a German legal document.",
 *       input_schema: zodToJsonSchema(TriageExtractionSchema),
 *     }],
 *     tool_choice: { type: "tool", name: "extract_document" },
 *     messages: [{ role: "user", content: [
 *       { type: "text", text: EXTRACTION_PROMPT },
 *       { type: "document", source: { type: "base64", media_type, data: base64pdf } },
 *     ]}],
 *   });
 *
 *   // Model is forced to call the tool — parse the input safely:
 *   const toolInput = response.content.find(b => b.type === "tool_use")?.input;
 *   const extracted = TriageExtractionSchema.parse(toolInput);
 *
 * This guarantees the model returns the exact shape we need. No hallucinated fields,
 * no missing nulls. Equivalent to Pydantic function calling in Python.
 */
export const TriageExtractionSchema = z.object({
  caseType: z.enum([
    "mahnbescheid",
    "consumer_debt",
    "rental_deposit",
    "wrongful_dismissal",
    "unknown",
  ]),
  documentTitle: z.string().describe("Short title including issuing party and date"),
  isInScope: z.boolean(),
  outOfScopeMessage: z.string().optional().describe("Only set if isInScope is false"),
  deadlineIso: z
    .string()
    .nullable()
    .describe("Response deadline as ISO 8601 date, e.g. '2025-03-26'"),
  creditorName: z.string().nullable(),
  claimedAmount: z
    .string()
    .nullable()
    .describe("Formatted in German style, e.g. '1.240,00 €'"),
  caseReference: z
    .string()
    .nullable()
    .describe("Aktenzeichen, e.g. '12 B 4821/25'. Mahnbescheid only."),
  courtName: z
    .string()
    .nullable()
    .describe("e.g. 'Amtsgericht Hagen'. Mahnbescheid only."),
  courtAddress: z
    .string()
    .nullable()
    .describe("Full postal address, newline-separated. Mahnbescheid only."),
});

export type TriageExtraction = z.infer<typeof TriageExtractionSchema>;

/** Convert extracted LLM data into a full TriageResult with computed fields. */
function toTriageResult(extracted: TriageExtraction): TriageResult {
  const deadline = extracted.deadlineIso ? new Date(extracted.deadlineIso) : null;
  const daysRemaining = deadline
    ? Math.ceil((deadline.getTime() - Date.now()) / 86_400_000)
    : null;

  const flatFeeTypes: CaseType[] = ["mahnbescheid", "consumer_debt"];
  const feeType = flatFeeTypes.includes(extracted.caseType as CaseType)
    ? "flat"
    : "success";

  return {
    caseType: extracted.caseType as CaseType,
    documentTitle: extracted.documentTitle,
    isInScope: extracted.isInScope,
    outOfScopeMessage: extracted.outOfScopeMessage,
    deadline,
    daysRemaining,
    creditorName: extracted.creditorName,
    claimedAmount: extracted.claimedAmount,
    caseReference: extracted.caseReference,
    courtName: extracted.courtName,
    courtAddress: extracted.courtAddress,
    feeType,
    feeAmount: feeType === "flat" ? 29 : null,
  };
}

/**
 * Analyses an uploaded document and returns structured triage data.
 * STUB — replace the body with real Claude tool-use call (see schema above).
 */
export async function analyseDocument(
  _fileBuffer: Buffer,
  _mimeType: string
): Promise<TriageResult> {
  await new Promise((r) => setTimeout(r, 800));

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 11);

  const stubExtraction: TriageExtraction = {
    caseType: "mahnbescheid",
    documentTitle: "Mahnbescheid vom Amtsgericht Hagen",
    isInScope: true,
    deadlineIso: deadline.toISOString().split("T")[0],
    creditorName: "Mustermann GmbH",
    claimedAmount: "1.240,00 €",
    caseReference: "12 B 4821/25",
    courtName: "Amtsgericht Hagen",
    courtAddress: "Heinitzstraße 42\n44623 Herne",
  };

  return toTriageResult(stubExtraction);
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
  return Buffer.from("PDF_PLACEHOLDER");
}