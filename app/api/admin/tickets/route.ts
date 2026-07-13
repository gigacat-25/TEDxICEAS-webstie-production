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
        { success: false, error: "Access Denied: You are not authorized to view this page." },
        { status: 403 }
      );
    }

    // 1. Fetch tickets from database
    const { data: tickets, error: dbError } = await supabaseAdmin
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("Fetch tickets database error:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to retrieve tickets from database." },
        { status: 500 }
      );
    }

    // 2. Generate signed URLs for screenshots
    const ticketsWithUrls = await Promise.all(
      tickets.map(async (ticket) => {
        if (!ticket.screenshot_path) {
          return { ...ticket, screenshot_url: null };
        }

        try {
          const { data: urlData, error: urlError } = await supabaseAdmin.storage
            .from("payment-screenshots")
            .createSignedUrl(ticket.screenshot_path, 3600); // 1 hour expiration

          if (urlError) {
            console.error(`Error signing URL for ticket ${ticket.id}:`, urlError);
            return { ...ticket, screenshot_url: null };
          }

          return {
            ...ticket,
            screenshot_url: urlData.signedUrl,
          };
        } catch (err) {
          console.error(`Error generating signed URL for ticket ${ticket.id}:`, err);
          return { ...ticket, screenshot_url: null };
        }
      })
    );

    return NextResponse.json({
      success: true,
      tickets: ticketsWithUrls,
    });

  } catch (error) {
    console.error("Admin tickets GET general error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
