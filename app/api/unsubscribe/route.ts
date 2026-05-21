import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateUnsubscribeToken } from "@/lib/emails/reaudit-notification";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
      return new NextResponse("Missing email or token", { status: 400 });
    }

    if (token !== generateUnsubscribeToken(email)) {
      return new NextResponse("Invalid unsubscribe link", { status: 401 });
    }

    if (!supabaseAdmin) {
      return new NextResponse("Supabase not configured", { status: 500 });
    }

    const { error } = await supabaseAdmin
      .from("email_preferences")
      .upsert({
        email,
        reaudit_emails_enabled: false,
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Failed to unsubscribe:", error);
      return new NextResponse("Failed to unsubscribe", { status: 500 });
    }

    return new NextResponse(
      "You have been unsubscribed from SpendLens re-audit pricing alerts.",
      {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }
    );
  } catch (err) {
    console.error("Unsubscribe API error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
