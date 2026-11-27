
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");

  // Only allow local paths to prevent external redirects.
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/";

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_code", url.origin)
    );
  }

  const supabase = await supabaseServer();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth callback error:", error.message);

    return NextResponse.redirect(
      new URL("/login?error=oauth_callback", url.origin)
    );
  }

  return NextResponse.redirect(new URL(safeNext, url.origin));
}
