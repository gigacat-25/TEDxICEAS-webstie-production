import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const usn = searchParams.get("usn");

    if (!usn) {
      return NextResponse.json(
        { success: false, error: "USN parameter is required." },
        { status: 400 }
      );
    }

    const cleanUsn = usn.trim().toUpperCase();

    // 1. Verify if USN exists in authorized list
    const { data: authorizedRows, error: authError } = await supabaseAdmin
      .from("authorized_usns")
      .select("usn")
      .eq("usn", cleanUsn)
      .maybeSingle();

    if (authError) {
      console.error("Database query error:", authError);
      return NextResponse.json(
        { success: false, error: "Database error verifying USN." },
        { status: 500 }
      );
    }

    if (!authorizedRows) {
      return NextResponse.json({
        success: true,
        valid: false,
        message: `The USN '${cleanUsn}' is not authorized for student pricing.`
      });
    }

    // 2. Verify if USN is already registered/pending
    const { data: existingTicket, error: ticketError } = await supabaseAdmin
      .from("tickets")
      .select("id, status")
      .eq("usn", cleanUsn)
      .in("status", ["pending", "approved"])
      .maybeSingle();

    if (ticketError) {
      console.error("Database query error:", ticketError);
      return NextResponse.json(
        { success: false, error: "Database error checking ticket status." },
        { status: 500 }
      );
    }

    if (existingTicket) {
      return NextResponse.json({
        success: true,
        valid: true,
        alreadyRegistered: true,
        message: `The USN '${cleanUsn}' has already booked a ticket (Status: ${existingTicket.status}).`
      });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      alreadyRegistered: false,
      message: "USN is valid and available."
    });
  } catch (error) {
    console.error("verify-usn API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
