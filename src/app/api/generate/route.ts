import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createCheckoutSession } from "@/lib/stripe";
import { TriageResult } from "@/types";

export const runtime = "nodejs";

// Service role client — bypasses RLS, server-side only
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { email, triage }: { email: string; triage: TriageResult } =
    await req.json();

  if (!email || !triage) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  // 1. Create or retrieve the Supabase user — no emails sent, magic link issued at /success
  const { data: created, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
    });

  let userId = created?.user?.id;

  if (!userId) {
    // User already exists — look them up
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    userId = users.find((u) => u.email === email)?.id;
  }

  if (!userId) {
    return NextResponse.json({ error: "Konto konnte nicht erstellt werden." }, { status: 500 });
  }

  // 2. Save the case to DB with status pending_payment
  const { data: caseRow, error: caseError } = await supabaseAdmin
    .from("cases")
    .insert({
      user_id: userId,
      case_type: triage.caseType,
      status: "pending_payment",
      document_title: triage.documentTitle,
      deadline: triage.deadline ?? null,
      triage_result: triage,
    })
    .select("id")
    .single();

  if (caseError || !caseRow) {
    console.error("DB error:", caseError);
    return NextResponse.json({ error: "Fall konnte nicht gespeichert werden." }, { status: 500 });
  }

  // 3. Create Stripe checkout session with the real case ID in metadata
  const origin = req.headers.get("origin") ?? "http://localhost:3000";

  const session = await createCheckoutSession({
    caseId: caseRow.id,
    email,
    amountCents: (triage.feeAmount ?? 29) * 100,
    successUrl: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/action`,
  });

  // 4. Store the Stripe session ID against the case for the webhook to look up
  await supabaseAdmin
    .from("cases")
    .update({ stripe_session: session.id })
    .eq("id", caseRow.id);

  return NextResponse.json({ checkoutUrl: session.url });
}