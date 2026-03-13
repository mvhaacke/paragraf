# Compliance Notes

## RDG (Rechtsdienstleistungsgesetz)

The product generates standardised legal documents and explains legal processes.
It does not give legal advice (Rechtsberatung). This distinction must be maintained
across all copy, UI, and AI output.

**Rules for AI output and UI copy:**
- State what the document is and what the process requires — never whether the user will win
- State deadlines and consequences as facts, not as strategic recommendations
- Never assess the strength of the user's legal position
- The Widerspruch (Phase 1) is safe: it is a procedural right, not a strategic judgement

**Required UI element (all in-scope triage screens):**
> "Dieses Angebot ersetzt keine individuelle Rechtsberatung."

---

## GDPR

Target audience: German residents. Compliance is mandatory before public launch.

### Pre-launch checklist

**Infrastructure**
- [ ] Sign DPA with Supabase (dashboard → Settings → Legal)
- [ ] Confirm Supabase EU data region is selected (Frankfurt)

**Legal documents**
- [ ] Datenschutzerklärung (privacy policy) — must cover: data collected, legal basis, retention period, user rights, contact for requests
- [ ] Impressum — legally required for German websites
- [ ] Cookie notice — only needed if analytics/tracking is added

**Product**
- [ ] Data deletion endpoint — user can delete their account and all associated data
- [ ] Retention policy enforced in code — delete uploaded documents after case closed + 90 days
- [ ] Collect only what is necessary — email + uploaded document + generated output, nothing else

### Legal basis for processing (Art. 6 GDPR)
- Core processing (document analysis, generation): **Art. 6(1)(b)** — performance of a contract
- Email for case updates: **Art. 6(1)(b)** — same basis, no separate consent needed
- If analytics are added later: **Art. 6(1)(a)** — explicit consent required

### Phase notes

**Phase 1 (Mahnbescheid / consumer debt)**
- Documents contain financial claim data — not special category under Art. 9
- Standard GDPR applies

**Phase 2 (Rental deposit)**
- Documents may reference living situation / address history — still not special category
- Standard GDPR applies

**Phase 3 (Wrongful dismissal)**
- Employment documents may contain health or disability references — could touch Art. 9
- Review document handling before Phase 3 launch