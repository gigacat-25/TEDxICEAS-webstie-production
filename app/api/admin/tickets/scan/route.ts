import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEventFlowEmail } from "@/lib/email";
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

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize admin
    const authenticated = await isAuthorizedAdmin();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You are not authorized to perform this action." },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const body = await req.json();
    const { ticket_code, action } = body;

    if (!ticket_code || !action || (action !== "check_in" && action !== "food" && action !== "goodie")) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid ticket_code or action." },
        { status: 400 }
      );
    }

    // 3. Fetch ticket details by ticket_code
    const { data: ticket, error: fetchError } = await supabaseAdmin
      .from("tickets")
      .select("*")
      .eq("ticket_code", ticket_code)
      .single();

    if (fetchError || !ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found or invalid QR code." },
        { status: 404 }
      );
    }

    // 4. Verify ticket status is approved
    if (ticket.status !== "approved") {
      return NextResponse.json(
        { 
          success: false, 
          error: `This ticket is current ${ticket.status.toUpperCase()}. Only approved tickets can be scanned.` 
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // 5. Handle action
    if (action === "check_in") {
      if (ticket.checked_in) {
        const formattedTime = new Date(ticket.checked_in_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        return NextResponse.json({
          success: false,
          already_claimed: true,
          message: `Attendee ${ticket.name} is ALREADY checked in (at ${formattedTime}).`,
          ticket,
        });
      }

      // Update check in status
      const { error: updateError } = await supabaseAdmin
        .from("tickets")
        .update({
          checked_in: true,
          checked_in_at: now,
          updated_at: now,
        })
        .eq("id", ticket.id);

      if (updateError) {
        console.error("Check in DB update error:", updateError);
        return NextResponse.json({ success: false, error: "Failed to update check-in status." }, { status: 500 });
      }

      // Send event flow email
      try {
        await sendEventFlowEmail(ticket.email, ticket.name);
      } catch (emailErr) {
        console.error("Failed to send event flow email:", emailErr);
      }

      return NextResponse.json({
        success: true,
        message: `Successfully checked in ${ticket.name}!`,
        ticket: { ...ticket, checked_in: true, checked_in_at: now },
      });

    } else if (action === "food") {
      if (ticket.food_claimed) {
        const formattedTime = new Date(ticket.food_claimed_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        return NextResponse.json({
          success: false,
          already_claimed: true,
          message: `Food pass for ${ticket.name} has ALREADY been claimed (at ${formattedTime}).`,
          ticket,
        });
      }

      // Update food status
      const { error: updateError } = await supabaseAdmin
        .from("tickets")
        .update({
          food_claimed: true,
          food_claimed_at: now,
          updated_at: now,
        })
        .eq("id", ticket.id);

      if (updateError) {
        console.error("Food DB update error:", updateError);
        return NextResponse.json({ success: false, error: "Failed to update food pass status." }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Food pass successfully claimed for ${ticket.name}!`,
        ticket: { ...ticket, food_claimed: true, food_claimed_at: now },
      });

    } else if (action === "goodie") {
      if (ticket.goodie_claimed) {
        const formattedTime = new Date(ticket.goodie_claimed_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        return NextResponse.json({
          success: false,
          already_claimed: true,
          message: `Goodie pass for ${ticket.name} has ALREADY been claimed (at ${formattedTime}).`,
          ticket,
        });
      }

      // Update goodie status
      const { error: updateError } = await supabaseAdmin
        .from("tickets")
        .update({
          goodie_claimed: true,
          goodie_claimed_at: now,
          updated_at: now,
        })
        .eq("id", ticket.id);

      if (updateError) {
        console.error("Goodie DB update error:", updateError);
        return NextResponse.json({ success: false, error: "Failed to update goodie pass status." }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Goodie pass successfully claimed for ${ticket.name}!`,
        ticket: { ...ticket, goodie_claimed: true, goodie_claimed_at: now },
      });
    }

  } catch (err) {
    console.error("Scanner scan API error:", err);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
