import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    // Fetch tickets associated with this Clerk userId
    const { data: tickets, error: dbError } = await supabaseAdmin
      .from("tickets")
      .select("id, name, email, phone, category, ticket_count, price_paid, status, ticket_code, rejection_reason, created_at")
      .eq("clerk_user_id", userId)
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("Fetch my tickets error:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to retrieve tickets." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tickets,
    });

  } catch (error) {
    console.error("My tickets GET API general error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
