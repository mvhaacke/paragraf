import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { SuccessClient } from "./SuccessClient";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  if (!session_id) redirect("/");

  const { data: caseRow } = await supabaseAdmin
    .from("cases")
    .select("id, user_id")
    .eq("stripe_session", session_id)
    .single();

  if (!caseRow) redirect(`/success/pending?session_id=${session_id}`);

  const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(caseRow.user_id);
  if (!user?.email) redirect("/");

  const reqHeaders = await headers();
  const host = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host");
  const proto = reqHeaders.get("x-forwarded-proto") ?? "http";
  const appUrl = host ? `${proto}://${host}` : "http://localhost:3000";

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: user.email,
    options: {
      redirectTo: `${appUrl}/auth/confirm?next=/dashboard/${caseRow.id}`,
    },
  });

  const loginUrl = (!error && data.properties?.action_link)
    ? data.properties.action_link
    : `/dashboard/login?success=1`;

  // Render a visible confirmation page — client component handles the redirect
  return (
    <SuccessClient
      email={user.email}
      caseId={caseRow.id}
      loginUrl={loginUrl}
    />
  );
}