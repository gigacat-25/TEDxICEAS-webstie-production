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

    // Fetch all tickets in the same transaction group (if group_id exists)
    const { data: groupTickets, error: groupError } = ticket.group_id
      ? await supabaseAdmin
          .from("tickets")
          .select("*")
          .eq("group_id", ticket.group_id)
      : { data: [ticket], error: null };

    if (groupError || !groupTickets || groupTickets.length === 0) {
      return NextResponse.json(
        { success: false, error: "Failed to retrieve linked transaction tickets." },
        { status: 500 }
      );
    }

    if (action === "approve") {
      const results: { name: string; ticketCode: string }[] = [];

      for (const t of groupTickets) {
        if (t.status !== "pending") continue;

        // Generate unique ticket code
        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const ticketCode = `TEDX-ICEAS-${randomCode}`;

        // Update status in database
        const { error: updateError } = await supabaseAdmin
          .from("tickets")
          .update({
            status: "approved",
            ticket_code: ticketCode,
            updated_at: new Date().toISOString(),
          })
          .eq("id", t.id);

        if (updateError) {
          console.error(`Approve ticket DB update error for ticket ${t.id}:`, updateError);
          continue;
        }

        results.push({ name: t.name, ticketCode });

        // Send Confirmation Email
        try {
          await sendApprovedTicketEmail(t.email, t.name, ticketCode, {
            category: t.category,
            ticketCount: 1,
            pricePaid: t.price_paid,
          });
        } catch (emailErr) {
          console.error(`Nodemailer approval email error for ${t.email}:`, emailErr);
        }
      }

      return NextResponse.json({ success: true, status: "approved", results });

    } else {
      // Rejection
      const rejectionReason = reason || "The uploaded payment screenshot could not be verified.";

      for (const t of groupTickets) {
        if (t.status !== "pending") continue;

        const { error: updateError } = await supabaseAdmin
          .from("tickets")
          .update({
            status: "rejected",
            rejection_reason: rejectionReason,
            updated_at: new Date().toISOString(),
          })
          .eq("id", t.id);

        if (updateError) {
          console.error(`Reject ticket DB update error for ticket ${t.id}:`, updateError);
          continue;
        }

        // Send Rejection Email
        try {
          await sendRejectedEmail(t.email, t.name, rejectionReason);
        } catch (emailErr) {
          console.error(`Nodemailer rejection email error for ${t.email}:`, emailErr);
        }
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
