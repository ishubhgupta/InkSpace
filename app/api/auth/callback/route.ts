import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Use the production URL for redirect
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://ink-space-livid.vercel.app";
  return NextResponse.redirect(new URL("/dashboard", baseUrl));
}
