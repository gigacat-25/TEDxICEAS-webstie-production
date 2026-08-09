export const maxDuration = 60; // Allow 60 seconds max execution time for bulk broadcasts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";
import { sendCustomBroadcastEmail, getTransporter } from "@/lib/email";

async function isAuthorizedAdmin() {
  const user = await currentUser();
  if (!user) return null;
  
  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase());

  if (!adminEmails.includes(email.toLowerCase())) {
    return null;
  }

  return user;
}

export async function POST(req: NextRequest) {
  try {
    const adminUser = await isAuthorizedAdmin();
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You are not authorized to send emails." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      subject,
      title,
      message,
      ctaText,
      ctaUrl,
      recipientMode = "all", // "all" | "selected" | "custom" | "test"
      selectedTicketIds = [],
      customEmails = [],
      testEmail = "",
      attachments = [], // Array<{ filename: string, content: string (base64), contentType?: string }>
      includeQRCode = true,
    } = body;

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { success: false, error: "Email Subject line is required." },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Email Message content is required." },
        { status: 400 }
      );
    }

    interface TargetRecipient {
      email: string;
      name: string;
      ticketCode?: string | null;
      category?: string | null;
    }

    let recipients: TargetRecipient[] = [];

    if (recipientMode === "test") {
      const targetTestEmail = (testEmail && testEmail.trim()) 
        || adminUser.emailAddresses[0]?.emailAddress 
        || "";

      if (!targetTestEmail) {
        return NextResponse.json(
          { success: false, error: "Test email address is invalid." },
          { status: 400 }
        );
      }

      recipients.push({
        email: targetTestEmail,
        name: adminUser.firstName || adminUser.username || "Admin Tester",
        ticketCode: "TEDX-TEST-9999",
        category: "Test VIP Attendee",
      });
    } else {
      // 1. Fetch only APPROVED tickets from Supabase database
      let query = supabaseAdmin
        .from("tickets")
        .select("id, name, email, ticket_code, category, status")
        .eq("status", "approved");

      if (recipientMode === "selected" && Array.isArray(selectedTicketIds) && selectedTicketIds.length > 0) {
        query = query.in("id", selectedTicketIds);
      }

      const { data: tickets, error: dbError } = await query;

      if (dbError) {
        console.error("Database query error when fetching approved tickets for email broadcast:", dbError);
        return NextResponse.json(
          { success: false, error: "Failed to fetch approved tickets from database." },
          { status: 500 }
        );
      }

      let approvedTickets = tickets || [];

      // If custom mode, filter down to emails in customEmails array
      if (recipientMode === "custom" && Array.isArray(customEmails) && customEmails.length > 0) {
        const normalizedCustom = customEmails.map((e: string) => e.trim().toLowerCase());
        approvedTickets = approvedTickets.filter((t) =>
          normalizedCustom.includes(t.email.toLowerCase())
        );

        // Also check if any custom emails provided don't exist as approved tickets
        const foundEmails = new Set(approvedTickets.map((t) => t.email.toLowerCase()));
        const missingEmails = normalizedCustom.filter((e: string) => !foundEmails.has(e));

        for (const missingEmail of missingEmails) {
          if (missingEmail) {
            recipients.push({
              email: missingEmail,
              name: "Valued Attendee",
              ticketCode: null,
              category: "Approved Ticket Holder",
            });
          }
        }
      }

      for (const t of approvedTickets) {
        recipients.push({
          email: t.email,
          name: t.name,
          ticketCode: t.ticket_code,
          category: t.category,
        });
      }
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: "No approved ticket holders found matching your recipient criteria." },
        { status: 404 }
      );
    }

    // Deduplicate recipients by email
    const uniqueRecipientsMap = new Map<string, TargetRecipient>();
    for (const r of recipients) {
      if (r.email && r.email.trim()) {
        uniqueRecipientsMap.set(r.email.toLowerCase(), r);
      }
    }

    const uniqueRecipients = Array.from(uniqueRecipientsMap.values());

    let successCount = 0;
    let failureCount = 0;
    const errors: { email: string; error: string }[] = [];

    // Create a single pooled SMTP transporter connection to share across all dispatches
    const pooledTransporter = getTransporter();

    // Process recipients in concurrent batches of 4 for maximum speed & SMTP safety
    const BATCH_SIZE = 4;
    for (let i = 0; i < uniqueRecipients.length; i += BATCH_SIZE) {
      const batch = uniqueRecipients.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((recipient) =>
          sendCustomBroadcastEmail({
            toEmail: recipient.email,
            name: recipient.name,
            ticketCode: recipient.ticketCode,
            category: recipient.category,
            subject: subject.trim(),
            title: title ? title.trim() : subject.trim(),
            message: message.trim(),
            ctaText: ctaText ? ctaText.trim() : undefined,
            ctaUrl: ctaUrl ? ctaUrl.trim() : undefined,
            attachments,
            includeQRCode,
            transporter: pooledTransporter,
          })
        )
      );

      results.forEach((res, idx) => {
        const recipient = batch[idx];
        if (res.status === "fulfilled") {
          successCount++;
        } else {
          console.error(`Failed to send broadcast email to ${recipient.email}:`, res.reason);
          failureCount++;
          errors.push({
            email: recipient.email,
            error: res.reason?.message || "Email dispatch failed.",
          });
        }
      });

      // Brief delay between batches to respect SMTP connection rates
      if (i + BATCH_SIZE < uniqueRecipients.length) {
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    }

    // Close the pooled transporter when batch dispatches complete
    if (pooledTransporter && typeof (pooledTransporter as any).close === "function") {
      try {
        (pooledTransporter as any).close();
      } catch (err) {
        // Ignore close error
      }
    }

    return NextResponse.json({
      success: true,
      totalCount: uniqueRecipients.length,
      successCount,
      failureCount,
      errors,
      message: `Successfully sent broadcast email to ${successCount} of ${uniqueRecipients.length} recipient(s).`,
    });

  } catch (error: any) {
    console.error("Admin send-email API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error while broadcasting emails." },
      { status: 500 }
    );
  }
}
