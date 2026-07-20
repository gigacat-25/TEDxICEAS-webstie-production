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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthorizedAdmin();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You are not authorized." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const updateFields: Record<string, any> = {};

    if (body.name !== undefined) updateFields.name = body.name.trim();
    if (body.email !== undefined) updateFields.email = body.email.trim();
    if (body.phone !== undefined) updateFields.phone = body.phone.trim();
    if (body.category !== undefined) updateFields.category = body.category;
    if (body.usn !== undefined) updateFields.usn = body.usn ? body.usn.trim().toUpperCase() : null;
    if (body.status !== undefined) updateFields.status = body.status;
    if (body.ticket_code !== undefined) updateFields.ticket_code = body.ticket_code ? body.ticket_code.trim().toUpperCase() : null;
    if (body.price_paid !== undefined) updateFields.price_paid = Number(body.price_paid);
    if (body.rejection_reason !== undefined) updateFields.rejection_reason = body.rejection_reason;

    updateFields.updated_at = new Date().toISOString();

    const { data: updatedTicket, error } = await supabaseAdmin
      .from("tickets")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update ticket error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update ticket in database." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Patch ticket API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
