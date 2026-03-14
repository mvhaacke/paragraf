# Paragraf — Project Instructions

## What this is
A German legal case companion that helps users respond to civil legal documents.
See `product_doc.md` for the full product brief.

---

## RDG Compliance — Critical

The Rechtsdienstleistungsgesetz prohibits providing legal advice (Rechtsberatung)
without a licence. All copy, UI text, and AI-generated content must stay within
legal information (Rechtsinformation).

### The line in practice

| Allowed — Rechtsinformation | Not allowed — Rechtsberatung |
|---|---|
| Explain what a document is and what the legal process requires | Assess whether the user's legal position is strong |
| State deadlines and procedural consequences as facts | Predict whether the user will win or lose |
| Describe what a Widerspruch does procedurally | Advise whether disputing is strategically wise given the user's specific facts |
| Generate a standardised procedural form | Draft personalised legal arguments |
| "Ein Widerspruch stoppt das Verfahren nach §694 ZPO" | "Sie werden diesen Fall wahrscheinlich gewinnen" |

### Required disclaimer
Every in-scope triage screen must include:
> "Dieses Angebot ersetzt keine individuelle Rechtsberatung."

### Tone rules (from product brief)
- Calm, direct, competent — like a knowledgeable friend
- State conclusions with brief procedural reasoning, never hedged
- The reasoning must cite the process/law, not the user's specific merits
- Show options neutrally before giving a recommendation
- Never repeat the negative outcome after stating it once

### Phrasing patterns to use
- "Das Gericht hat nicht geprüft, ob die Forderung berechtigt ist."
- "Ein Widerspruch stoppt das Verfahren — ohne Begründung."
- "Der Gläubiger müsste dann Klage erheben."
- "Die Frist endet am [date] — das ist eine gesetzliche Frist."

### Phrasing patterns to avoid
- "Sie haben gute Chancen..."
- "In Ihrem Fall empfehlen wir..."  ← too advisory
- "Das Gericht wird wahrscheinlich..."
- "Sie sollten unbedingt..." ← hedging/advising hybrid
- Any prediction about outcome

---

## Product rules (from brief)
- Deadline shown prominently on every relevant screen
- Negative consequence stated once, never repeated
- Out-of-scope cases: graceful exit, suggest Mieterverein or lawyer
- No account required until after first payment
- All prior documents and facts carried forward across the case journey