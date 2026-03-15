import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { CaseType, TriageResult } from "@/types";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

// ── Zod schemas — used to parse and validate LLM tool output ─────────────────

// LLM tools sometimes return undefined for optional fields instead of null.
const nullableStr = z.string().nullish().transform(v => v ?? null);

const ClassificationSchema = z.object({
  isInScope: z.boolean(),
  caseType: z.enum(["mahnbescheid", "vollstreckungsbescheid", "consumer_debt", "none"]),
  outOfScopeReason: nullableStr,
  documentTitle: z.string(),
});

const MahnbescheidSchema = z.object({
  courtName: nullableStr,
  courtAddress: nullableStr,
  caseReference: nullableStr,
  issuedDate: nullableStr,
  statedDeadlineIso: nullableStr,
  claimedAmount: nullableStr,
  creditorName: nullableStr,
});

const ConsumerDebtSchema = z.object({
  creditorName: nullableStr,
  creditorAddress: nullableStr,
  creditorReference: nullableStr,
  claimedAmount: nullableStr,
  statedDeadlineIso: nullableStr,
});

// ── JSON schemas for Claude tool definitions ──────────────────────────────────
// Defined separately from Zod to keep the tool call signatures explicit.

const CLASSIFY_SCHEMA: Anthropic.Tool["input_schema"] = {
  type: "object",
  properties: {
    isInScope: {
      type: "boolean",
      description: "true if this is a Mahnbescheid, Vollstreckungsbescheid, or consumer debt collection letter (Inkasso). false for everything else.",
    },
    caseType: {
      type: "string",
      enum: ["mahnbescheid", "vollstreckungsbescheid", "consumer_debt", "none"],
      description: "Use the document heading as the primary signal. mahnbescheid = heading says 'Mahnbescheid', issued by Amtsgericht (§688 ZPO). vollstreckungsbescheid = heading says 'Vollstreckungsbescheid', issued by Amtsgericht after unanswered Mahnbescheid (§699 ZPO). consumer_debt = private creditor or Inkasso agency, no court. none = anything else.",
    },
    outOfScopeReason: {
      type: "string",
      description: "If isInScope is false: brief German sentence explaining what the document is and that it falls outside the supported case types. Null if in scope.",
    },
    documentTitle: {
      type: "string",
      description: "Short German title including the document type and issuer, e.g. 'Mahnbescheid vom Amtsgericht Hagen, 12.03.2026'.",
    },
  },
  required: ["isInScope", "documentTitle", "caseType", "outOfScopeReason"],
};

const MAHNBESCHEID_SCHEMA: Anthropic.Tool["input_schema"] = {
  type: "object",
  properties: {
    courtName: {
      type: "string",
      description: "Name of the issuing court, e.g. 'Amtsgericht Hagen'. Null if not found.",
    },
    courtAddress: {
      type: "string",
      description: "Full postal address of the court, newline-separated (street, postcode city). Null if not found.",
    },
    caseReference: {
      type: "string",
      description: "Aktenzeichen (case reference), e.g. '12 B 4821/25'. Null if not found.",
    },
    issuedDate: {
      type: "string",
      description: "Date the Mahnbescheid was issued, ISO 8601 (YYYY-MM-DD). Null if not found.",
    },
    statedDeadlineIso: {
      type: "string",
      description: "The Widerspruchsfrist (objection deadline) as explicitly stated in the document, ISO 8601. Null if not stated.",
    },
    claimedAmount: {
      type: "string",
      description: "Total claimed amount in German format, e.g. '1.240,00 €'. Null if not found.",
    },
    creditorName: {
      type: "string",
      description: "Name of the creditor (Antragsteller). Null if not found.",
    },
  },
  required: [],
};

const CONSUMER_DEBT_SCHEMA: Anthropic.Tool["input_schema"] = {
  type: "object",
  properties: {
    creditorName: {
      type: "string",
      description: "Name of the creditor or Inkasso agency sending the letter. Null if not found.",
    },
    creditorAddress: {
      type: "string",
      description: "Full postal address of the creditor, newline-separated. Null if not found.",
    },
    creditorReference: {
      type: "string",
      description: "Creditor's internal reference or Forderungsnummer. Null if not found.",
    },
    claimedAmount: {
      type: "string",
      description: "Total claimed amount in German format, e.g. '1.240,00 €'. Null if not found.",
    },
    statedDeadlineIso: {
      type: "string",
      description: "Deadline stated in the letter, ISO 8601. Null if not stated (common — Inkasso deadlines have no legal force).",
    },
  },
  required: [],
};

// ── Content builder — PDF or image, sent natively to Claude ──────────────────

type DocumentContent = Anthropic.Base64PDFSource | Anthropic.Base64ImageSource;

function buildDocumentContent(buffer: Buffer, mimeType: string): DocumentContent {
  const data = buffer.toString("base64");
  if (mimeType === "application/pdf") {
    return {
      type: "base64",
      media_type: "application/pdf",
      data,
    } as Anthropic.Base64PDFSource;
  }
  return {
    type: "base64",
    media_type: mimeType as "image/jpeg" | "image/png",
    data,
  } as Anthropic.Base64ImageSource;
}

// ── Stage 1: Classification ───────────────────────────────────────────────────

const CLASSIFY_PROMPT =
  `Du analysierst ein deutsches Rechtsdokument. Bestimme den genauen Dokumenttyp anhand der Überschrift und des Inhalts.

ÜBERSCHRIFT ist das wichtigste Merkmal:
- Steht oben "Mahnbescheid" → caseType = mahnbescheid
- Steht oben "Vollstreckungsbescheid" → caseType = vollstreckungsbescheid
- Kein Gericht, sondern privater Absender oder Inkassobüro → caseType = consumer_debt
- Alles andere → caseType = none

Zusätzliche Merkmale zur Unterscheidung:
- mahnbescheid (§688 ZPO): Erstforderung vom Amtsgericht, Widerspruchsfrist 14 Tage
- vollstreckungsbescheid (§699 ZPO): Folgedokument nach unbeantworteten Mahnbescheid, enthält Einspruchshinweis (§700 ZPO), verweist auf früheres Aktenzeichen
- consumer_debt: kein Amtsgericht als Absender, oft Inkasso, Mahnschreiben, Forderungsaufstellung

Wenn der Inhalt unklar oder unleserlich ist, setze isInScope auf false mit entsprechender Begründung.`;

async function classifyDocument(
  buffer: Buffer,
  mimeType: string
): Promise<z.infer<typeof ClassificationSchema>> {
  const docContent = buildDocumentContent(buffer, mimeType);
  const contentBlock: Anthropic.MessageParam["content"] = mimeType === "application/pdf"
    ? [{ type: "document", source: docContent as Anthropic.Base64PDFSource }, { type: "text", text: CLASSIFY_PROMPT }]
    : [{ type: "image", source: docContent as Anthropic.Base64ImageSource }, { type: "text", text: CLASSIFY_PROMPT }];

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    tools: [{ name: "classify", description: "Classify a German legal document", input_schema: CLASSIFY_SCHEMA }],
    tool_choice: { type: "tool", name: "classify" },
    messages: [{ role: "user", content: contentBlock }],
  });

  const toolInput = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")?.input;
  if (!toolInput) throw new Error("Klassifizierung fehlgeschlagen.");

  try {
    return ClassificationSchema.parse(toolInput);
  } catch {
    // Unexpected model output — treat as out-of-scope rather than crashing
    return {
      isInScope: false,
      caseType: "none" as const,
      outOfScopeReason: "Das Dokument konnte nicht klassifiziert werden.",
      documentTitle: "Unbekanntes Dokument",
    };
  }
}

// ── Stage 2: Type-specific field extraction ───────────────────────────────────

const EXTRACT_PROMPT =
  `Extrahiere die folgenden Felder exakt wie sie im Dokument stehen. Übertrage Werte wörtlich — keine Interpretation, keine Umformulierung. Setze Felder auf null, wenn sie nicht vorhanden sind.`;

async function extractMahnbescheid(
  buffer: Buffer,
  mimeType: string
): Promise<z.infer<typeof MahnbescheidSchema>> {
  const docContent = buildDocumentContent(buffer, mimeType);
  const contentBlock: Anthropic.MessageParam["content"] = mimeType === "application/pdf"
    ? [{ type: "document", source: docContent as Anthropic.Base64PDFSource }, { type: "text", text: EXTRACT_PROMPT }]
    : [{ type: "image", source: docContent as Anthropic.Base64ImageSource }, { type: "text", text: EXTRACT_PROMPT }];

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    tools: [{ name: "extract_mahnbescheid", description: "Extract fields from a Mahnbescheid", input_schema: MAHNBESCHEID_SCHEMA }],
    tool_choice: { type: "tool", name: "extract_mahnbescheid" },
    messages: [{ role: "user", content: contentBlock }],
  });

  const toolInput = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")?.input;
  if (!toolInput) throw new Error("Extraktion fehlgeschlagen.");
  return MahnbescheidSchema.parse(toolInput);
}

async function extractConsumerDebt(
  buffer: Buffer,
  mimeType: string
): Promise<z.infer<typeof ConsumerDebtSchema>> {
  const docContent = buildDocumentContent(buffer, mimeType);
  const contentBlock: Anthropic.MessageParam["content"] = mimeType === "application/pdf"
    ? [{ type: "document", source: docContent as Anthropic.Base64PDFSource }, { type: "text", text: EXTRACT_PROMPT }]
    : [{ type: "image", source: docContent as Anthropic.Base64ImageSource }, { type: "text", text: EXTRACT_PROMPT }];

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    tools: [{ name: "extract_consumer_debt", description: "Extract fields from a consumer debt collection letter", input_schema: CONSUMER_DEBT_SCHEMA }],
    tool_choice: { type: "tool", name: "extract_consumer_debt" },
    messages: [{ role: "user", content: contentBlock }],
  });

  const toolInput = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")?.input;
  if (!toolInput) throw new Error("Extraktion fehlgeschlagen.");
  return ConsumerDebtSchema.parse(toolInput);
}

// ── Deadline helpers ──────────────────────────────────────────────────────────

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function computeDeadline(isoDate: string | null) {
  if (!isoDate) return { deadline: null, daysRemaining: null };
  const deadline = new Date(isoDate);
  const daysRemaining = Math.ceil((deadline.getTime() - Date.now()) / 86_400_000);
  return { deadline, daysRemaining };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function analyseDocument(buffer: Buffer, mimeType: string): Promise<TriageResult> {
  const classification = await classifyDocument(buffer, mimeType);

  if (!classification.isInScope || classification.caseType === "none") {
    return {
      caseType: "unknown" as CaseType,
      documentTitle: classification.documentTitle,
      isInScope: false,
      outOfScopeMessage:
        classification.outOfScopeReason ??
        "Dieses Dokument liegt außerhalb unseres Bereichs.",
      deadline: null,
      daysRemaining: null,
      creditorName: null,
      claimedAmount: null,
      caseReference: null,
      courtName: null,
      courtAddress: null,
      feeType: "flat",
      feeAmount: null,
    };
  }

  if (classification.caseType === "mahnbescheid") {
    const fields = await extractMahnbescheid(buffer, mimeType);
    const deadlineIso =
      fields.statedDeadlineIso ??
      (fields.issuedDate ? addDays(fields.issuedDate, 14) : null);
    const { deadline, daysRemaining } = computeDeadline(deadlineIso);

    return {
      caseType: "mahnbescheid",
      documentTitle: classification.documentTitle,
      isInScope: true,
      deadline,
      daysRemaining,
      creditorName: fields.creditorName,
      claimedAmount: fields.claimedAmount,
      caseReference: fields.caseReference,
      courtName: fields.courtName,
      courtAddress: fields.courtAddress,
      feeType: "flat",
      feeAmount: 39,
    };
  }

  if (classification.caseType === "vollstreckungsbescheid") {
    // Vollstreckungsbescheid carries the same fields as Mahnbescheid.
    // Einspruchsfrist §700 ZPO: 14 days from service, same arithmetic as §694 ZPO.
    const fields = await extractMahnbescheid(buffer, mimeType);
    const deadlineIso =
      fields.statedDeadlineIso ??
      (fields.issuedDate ? addDays(fields.issuedDate, 14) : null);
    const { deadline, daysRemaining } = computeDeadline(deadlineIso);

    return {
      caseType: "vollstreckungsbescheid",
      documentTitle: classification.documentTitle,
      isInScope: true,
      deadline,
      daysRemaining,
      creditorName: fields.creditorName,
      claimedAmount: fields.claimedAmount,
      caseReference: fields.caseReference,
      courtName: fields.courtName,
      courtAddress: fields.courtAddress,
      feeType: "flat",
      feeAmount: 39,
    };
  }

  // consumer_debt
  const fields = await extractConsumerDebt(buffer, mimeType);
  const { deadline, daysRemaining } = computeDeadline(fields.statedDeadlineIso);

  return {
    caseType: "consumer_debt",
    documentTitle: classification.documentTitle,
    isInScope: true,
    deadline,
    daysRemaining,
    creditorName: fields.creditorName,
    claimedAmount: fields.claimedAmount,
    caseReference: fields.creditorReference,
    courtName: null,
    courtAddress: fields.creditorAddress,
    feeType: "flat",
    feeAmount: 29,
  };
}

/**
 * Generates the court-ready response document as a PDF buffer.
 * Document content comes entirely from templates (src/lib/templates.ts) —
 * no LLM involvement. Stub until PDF generation is wired up.
 */
export async function generateResponseDocument(
  _triageResult: TriageResult,
  _additionalFacts: Record<string, string>
): Promise<Buffer> {
  await new Promise((r) => setTimeout(r, 1200));
  return Buffer.from("PDF_PLACEHOLDER");
}