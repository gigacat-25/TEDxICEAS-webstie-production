import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendApprovedTicketEmail, sendRejectedEmail } from "@/lib/email";
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthorizedAdmin();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You are not authorized to view this page." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { action, reason } = body;

    if (!action || (action !== "approve" && action !== "reject")) {
      return NextResponse.json(
        { success: false, error: "Invalid action. Must be 'approve' or 'reject'." },
        { status: 400 }
      );
    }

    // 1. Fetch ticket to verify it exists and get attendee details
    const { data: ticket, error: fetchError } = await supabaseAdmin
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found." },
        { status: 444 }
      );
    }

    if (ticket.status !== "pending") {
      return NextResponse.json(
        { success: false, error: "Ticket is already processed." },
        { status: 400 }
      );
    }

    if (action === "approve") {
      // 2. Generate unique ticket code
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const ticketCode = `TEDX-ICEAS-${randomCode}`;

      // 3. Update status to approved in Database
      const { error: updateError } = await supabaseAdmin
        .from("tickets")
        .update({
          status: "approved",
          ticket_code: ticketCode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        console.error("Approve ticket DB update error:", updateError);
        return NextResponse.json(
          { success: false, error: "Failed to approve ticket in database." },
          { status: 500 }
        );
      }

      // 4. Send Confirmation Email via Nodemailer
      try {
        await sendApprovedTicketEmail(ticket.email, ticket.name, ticketCode, {
          category: ticket.category,
          ticketCount: ticket.ticket_count,
          pricePaid: ticket.price_paid,
        });
      } catch (emailErr) {
        console.error("Nodemailer approval email error:", emailErr);
      }

      return NextResponse.json({ success: true, status: "approved", ticketCode });

    } else {
      // rejection
      const rejectionReason = reason || "The uploaded payment screenshot could not be verified.";

      // 3. Update status to rejected in Database
      const { error: updateError } = await supabaseAdmin
        .from("tickets")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        console.error("Reject ticket DB update error:", updateError);
        return NextResponse.json(
          { success: false, error: "Failed to reject ticket in database." },
          { status: 500 }
        );
      }

      // 4. Send Rejection Email via Nodemailer
      try {
        await sendRejectedEmail(ticket.email, ticket.name, rejectionReason);
      } catch (emailErr) {
        console.error("Nodemailer rejection email error:", emailErr);
      }

      return NextResponse.json({ success: true, status: "rejected" });
    }

  } catch (error) {
    console.error("Ticket action API general error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
