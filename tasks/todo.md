# Paragraf — Task Tracker

## Phase 1: Mahnbescheid + Consumer Debt (Core Loop)

### Infrastructure
- [x] Scaffold Next.js 16, TypeScript, Tailwind, App Router
- [x] Install Supabase, Stripe, Zod, Lucide
- [x] Define types (CaseType, CaseStatus, TriageResult, Case)
- [x] Stub AI layer (analyseDocument, generateResponseDocument)
- [x] Write Supabase schema (cases, documents, RLS, storage buckets)
- [ ] Apply schema to Supabase project + configure .env.local
- [ ] Create storage buckets (uploads, documents) in Supabase dashboard

### Pages
- [x] `/` — upload landing page
- [x] `/triage` — free analysis + document preview
- [x] `/action` — email + pay
- [x] `/dashboard` — case list (server component, auth-gated)
- [ ] `/dashboard/[caseId]` — case detail + document download
- [ ] `/dashboard/[caseId]/hearing` — hearing prep

### Transparency copy (triage page — before payment)
**Core principle: transparency is the product's main differentiator.**
Users arrive scared. The outcome statistics belong on the triage page, in the options section,
at the moment of peak anxiety — not hidden behind a paywall.
A user who understands the process is more likely to dispute, and more likely to pay.

- [ ] Add outcome context to the "Widerspruch / Bestreiten" option card on `/triage`:
  - Mahnbescheid: "Viele Gläubiger erheben nach einem Widerspruch keine Klage — besonders
    bei kleinen Beträgen oder wenn die Forderung schlecht belegt ist."
  - Inkassoschreiben: "Inkassobüros haben keine behördliche Befugnis. Viele Forderungen
    sind verjährt oder unzureichend belegt. Ein Widerspruch beendet den Kontakt häufig."
  - Phrasing stays within Rechtsinformation — describes what typically happens procedurally,
    never predicts the user's specific outcome.

### Post-payment UX (case detail `/dashboard/[caseId]`)
- [ ] Step-by-step guide — case-specific, pre-filled with their data
  (court name, deadline date, creditor) so it reads like personal guidance, not a template
- [ ] Checkable progress steps (print → send → keep copy → wait) — persisted in DB
- [ ] Prominent deadline countdown that stays relevant post-payment
- [ ] "Ich habe eine Antwort erhalten" — second upload slot to handle follow-up documents
  (entry point for future upsell or Phase 2)

### API / Backend
- [x] `POST /api/upload` — receive PDF, return triage stub
- [x] `POST /api/generate` — create Stripe checkout session
- [x] `POST /api/webhook` — Stripe payment confirmed (TODO: save to DB)
- [x] Wire webhook: create user (Supabase auth), save case, update status on payment
- [ ] Data deletion endpoint (GDPR)
- [ ] Document download endpoint (signed URL)

### Payments
- [ ] Configure Stripe account + add real keys
- [ ] Test checkout flow end-to-end (test mode)
- [ ] Set up Stripe webhook in dashboard + add signing secret

### AI (real implementation)
- [ ] PDF text extraction (pdf-parse or similar)
- [ ] Claude API integration — document classification + data extraction
- [ ] Widerspruch template rendering → PDF generation
- [ ] Validate output quality against 3–5 real Mahnbescheid samples

### Pre-launch (Phase 1)
- [ ] RDG disclaimer on triage page
- [ ] Datenschutzerklärung page
- [ ] Impressum page
- [ ] Sign DPA with Supabase (Frankfurt region confirmed)
- [ ] Retention policy / auto-delete cron
- [ ] Deploy to Vercel

---

## Phase 2: Rental Deposit
_Not started. Depends on Phase 1 infrastructure._

## Phase 3: Wrongful Dismissal
_Not started. Depends on Phase 2 infrastructure. Requires Art. 9 GDPR review._