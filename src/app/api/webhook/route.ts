import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const caseId = session.metadata?.caseId;

    if (!caseId) {
      return NextResponse.json({ error: "Missing caseId" }, { status: 400 });
    }

    // Update case status to document_ready
    const { error } = await supabaseAdmin
      .from("cases")
      .update({ status: "document_ready" })
      .eq("id", caseId);

    if (error) {
      console.error("Failed to update case status:", error);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    // TODO (Phase 1 AI): generate the Widerspruch PDF and store it in the
    // documents bucket at {user_id}/{caseId}/widerspruch.pdf, then insert
    // a row into the documents table.
    console.log("Payment confirmed, case ready:", caseId);
  }

  return NextResponse.json({ received: true });
}