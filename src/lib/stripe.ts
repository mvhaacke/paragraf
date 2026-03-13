import Stripe from "stripe";

// Server-side Stripe client (never exposed to the browser)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export const FLAT_FEE_PRICE_EUR = 29_00; // €29 in cents

/** Creates a Stripe Checkout session for flat-fee cases */
export async function createCheckoutSession({
  caseId,
  email,
  amountCents,
  successUrl,
  cancelUrl,
}: {
  caseId: string;
  email?: string;
  amountCents: number;
  successUrl: string;
  cancelUrl: string;
}) {
  return stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: amountCents,
          product_data: {
            name: "Paragraf — Rechtsdokument erstellen",
            description: "Gerichtsfertige Antwort + Einreichungsanleitung",
          },
        },
        quantity: 1,
      },
    ],
    metadata: { caseId },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}