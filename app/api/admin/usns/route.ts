import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";

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

export async function GET(req: NextRequest) {
  try {
    const authenticated = await isAuthorizedAdmin();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You are not authorized." },
        { status: 403 }
      );
    }

    const { data: usns, error: dbError } = await supabaseAdmin
      .from("authorized_usns")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("Fetch USNs database error:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to retrieve USNs from database." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, usns });
  } catch (error) {
    console.error("GET USNs handler error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authenticated = await isAuthorizedAdmin();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You are not authorized." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { usns } = body as { usns: string[] };

    if (!usns || !Array.isArray(usns)) {
      return NextResponse.json(
        { success: false, error: "Invalid payload: 'usns' array is required." },
        { status: 400 }
      );
    }

    // Clean and filter empty values
    const cleanUsns = usns
      .map((u) => u.trim().toUpperCase())
      .filter(Boolean);

    if (cleanUsns.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid USN strings provided." },
        { status: 400 }
      );
    }

    // Prepare rows for upsert/insert
    const rows = cleanUsns.map((u) => ({ usn: u }));

    const { data, error: dbError } = await supabaseAdmin
      .from("authorized_usns")
      .upsert(rows, { onConflict: "usn" })
      .select();

    if (dbError) {
      console.error("Bulk USN insert database error:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to save USNs to database." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully authorized ${cleanUsns.length} USN(s).`,
      count: cleanUsns.length,
      data
    });
  } catch (error) {
    console.error("POST USNs handler error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authenticated = await isAuthorizedAdmin();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You are not authorized." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const usnToDelete = searchParams.get("usn");

    if (!usnToDelete) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter 'usn'." },
        { status: 400 }
      );
    }

    const { error: dbError } = await supabaseAdmin
      .from("authorized_usns")
      .delete()
      .eq("usn", usnToDelete.trim().toUpperCase());

    if (dbError) {
      console.error("Delete USN database error:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to delete USN from database." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted USN '${usnToDelete.toUpperCase()}' from authorization list.`
    });
  } catch (error) {
    console.error("DELETE USN handler error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
