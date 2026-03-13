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