export type CaseType =
  | "mahnbescheid"
  | "vollstreckungsbescheid"
  | "consumer_debt"
  | "rental_deposit"
  | "wrongful_dismissal"
  | "unknown";

export type CaseStatus =
  | "triage"
  | "pending_payment"
  | "document_ready"
  | "filed"
  | "hearing_scheduled"
  | "closed";

export type FeeType = "flat" | "success";

/**
 * Structured data extracted from the uploaded document by the LLM.
 * No copy fields — all display text is generated from templates in lib/templates.ts.
 *
 * When wiring up real AI calls, use TriageExtractionSchema (Zod) as the tool
 * definition so the model is forced to return this exact shape.
 */
export interface TriageResult {
  caseType: CaseType;
  documentTitle: string;
  isInScope: boolean;
  outOfScopeMessage?: string;

  // Extracted from the document
  deadline: Date | null;
  daysRemaining: number | null;
  creditorName: string | null;
  claimedAmount: string | null;
  caseReference: string | null;  // Mahnbescheid + Vollstreckungsbescheid only
  courtName: string | null;      // Mahnbescheid + Vollstreckungsbescheid only
  courtAddress: string | null;   // Mahnbescheid + Vollstreckungsbescheid only

  // Fee
  feeType: FeeType;
  feeAmount: number | null;
}

export interface Case {
  id: string;
  userId: string;
  caseType: CaseType;
  status: CaseStatus;
  documentTitle: string;
  deadline: string | null;
  triageResult: TriageResult;
  createdAt: string;
  updatedAt: string;
}