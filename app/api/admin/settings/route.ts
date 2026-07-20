import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";

const DEFAULT_TOTAL_SEATS = 100;

export async function getDynamicTotalSeats(): Promise<number> {
  try {
    const { data, error } = await supabaseAdmin
      .from("event_settings")
      .select("value")
      .eq("key", "total_seats")
      .maybeSingle();

    if (error || !data || !data.value) {
      const envSeats = parseInt(process.env.TOTAL_SEATS || "", 10);
      return !isNaN(envSeats) && envSeats > 0 ? envSeats : DEFAULT_TOTAL_SEATS;
    }

    const seats = parseInt(data.value, 10);
    return !isNaN(seats) && seats > 0 ? seats : DEFAULT_TOTAL_SEATS;
  } catch (err) {
    console.warn("Failed to fetch dynamic total seats from DB, using fallback:", err);
    return DEFAULT_TOTAL_SEATS;
  }
}

async function isAuthorizedAdmin() {
  const user = await currentUser();
  if (!user) return false;
  
  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) return false;

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase());

  return adminEmails.includes(email.toLowerCase());
}

export async function GET() {
  try {
    const totalSeats = await getDynamicTotalSeats();
    return NextResponse.json({
      success: true,
      total_seats: totalSeats,
    });
  } catch (error) {
    console.error("GET admin settings error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authenticated = await isAuthorizedAdmin();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You are not authorized." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const newTotalSeats = parseInt(body.total_seats, 10);

    if (isNaN(newTotalSeats) || newTotalSeats <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid seat capacity. Must be a positive number." },
        { status: 400 }
      );
    }

    // Try upserting into event_settings table in Supabase
    const { error: upsertError } = await supabaseAdmin
      .from("event_settings")
      .upsert(
        { key: "total_seats", value: String(newTotalSeats), updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );

    if (upsertError) {
      console.error("Upsert event_settings error:", upsertError);
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to update database. Please ensure 'event_settings' table exists in Supabase." 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      total_seats: newTotalSeats,
      message: `Total seat capacity updated to ${newTotalSeats}!`,
    });
  } catch (error) {
    console.error("PATCH admin settings error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
