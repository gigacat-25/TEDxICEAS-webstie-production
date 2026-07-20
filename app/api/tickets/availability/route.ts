import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getDynamicTotalSeats } from "@/app/api/admin/settings/route";

export async function GET(req: NextRequest) {
  try {
    const totalSeats = await getDynamicTotalSeats();

    // Count tickets that are active (pending or approved)
    const { count, error } = await supabaseAdmin
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "approved"]);

    if (error) {
      console.error("Fetch ticket availability error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch ticket availability." },
        { status: 500 }
      );
    }

    const bookedCount = count || 0;
    const remainingSeats = Math.max(0, totalSeats - bookedCount);
    const isSoldOut = bookedCount >= totalSeats;

    return NextResponse.json({
      success: true,
      totalSeats,
      bookedCount,
      remainingSeats,
      isSoldOut,
    });
  } catch (error) {
    console.error("Availability GET API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
