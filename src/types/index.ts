export type CaseType =
  | "mahnbescheid"
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

export interface TriageResult {
  caseType: CaseType;
  documentTitle: string;
  deadline: Date | null;
  daysRemaining: number | null;
  summary: string;
  consequence: string;
  recommendation: string;
  recommendationReasoning: string;
  feeType: FeeType;
  feeAmount: number | null; // EUR, null for success-fee cases
  isInScope: boolean;
  outOfScopeMessage?: string;
  // Extracted from the document — used to render the response preview
  caseReference: string | null;   // Aktenzeichen, e.g. "12 B 1234/25"
  courtName: string | null;       // e.g. "Amtsgericht Hagen"
  courtAddress: string | null;    // full postal address of the court
  claimedAmount: string | null;   // e.g. "1.240,00 €"
  creditorName: string | null;
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