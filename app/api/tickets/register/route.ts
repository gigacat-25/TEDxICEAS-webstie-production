import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendPendingConfirmationEmail } from "@/lib/email";
import { auth } from "@clerk/nextjs/server";
import { getDynamicTotalSeats } from "@/app/api/admin/settings/route";

export async function POST(req: NextRequest) {
  try {
    // Check Clerk authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required to register tickets." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const category = formData.get("category") as string;
    const ticketCountStr = formData.get("ticketCount") as string;
    const pricePaidStr = formData.get("pricePaid") as string;
    const screenshot = formData.get("screenshot") as File | null;
    const additionalAttendeesStr = formData.get("additionalAttendees") as string | null;
    const usn = formData.get("usn") as string | null;

    if (!name || !email || !phone || !category || !ticketCountStr || !pricePaidStr || !screenshot) {
      return NextResponse.json(
        { success: false, error: "Missing required fields or file." },
        { status: 400 }
      );
    }

    const ticketCount = parseInt(ticketCountStr, 10);
    const pricePaid = parseFloat(pricePaidStr);

    // Enforce Dynamic Seat Capacity Limit
    const MAX_SEATS = await getDynamicTotalSeats();
    const { count: currentBookedCount, error: countError } = await supabaseAdmin
      .from("tickets")
      .select("*", { head: true, count: "exact" })
      .in("status", ["pending", "approved"]);

    if (countError) {
      console.error("Seat limit check database error:", countError);
      return NextResponse.json(
        { success: false, error: "Failed to verify seat availability." },
        { status: 500 }
      );
    }

    const currentBooked = currentBookedCount || 0;
    if (currentBooked >= MAX_SEATS) {
      return NextResponse.json(
        { success: false, error: `Tickets are completely sold out! The ${MAX_SEATS} seat capacity limit has been reached.` },
        { status: 400 }
      );
    }

    if (currentBooked + ticketCount > MAX_SEATS) {
      const remaining = MAX_SEATS - currentBooked;
      return NextResponse.json(
        { success: false, error: `Only ${remaining} seat(s) remaining out of the ${MAX_SEATS} total capacity. You requested ${ticketCount} seat(s).` },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format." },
        { status: 400 }
      );
    }

    // Parse and validate additional attendees
    let additionalAttendees: { name: string; email: string; usn: string }[] = [];
    if (additionalAttendeesStr) {
      try {
        additionalAttendees = JSON.parse(additionalAttendeesStr);
      } catch (err) {
        console.error("Failed to parse additionalAttendees JSON:", err);
      }
    }

    if (ticketCount > 1) {
      if (additionalAttendees.length !== ticketCount - 1) {
        return NextResponse.json(
          { success: false, error: "Mismatch between ticketCount and additional attendees provided." },
          { status: 400 }
        );
      }
      for (const att of additionalAttendees) {
        if (!att.name || !att.name.trim()) {
          return NextResponse.json(
            { success: false, error: "All additional attendees must have a valid name." },
            { status: 400 }
          );
        }
        if (!att.email || !emailRegex.test(att.email)) {
          return NextResponse.json(
            { success: false, error: `Invalid email format for attendee ${att.name}.` },
            { status: 400 }
          );
        }
      }
    }

    // Student USN Validation
    if (category === "Student" || category === "Impact College Students") {
      if (ticketCount !== 1) {
        return NextResponse.json(
          { success: false, error: "Student registrations are limited to exactly 1 ticket per booking." },
          { status: 400 }
        );
      }
      const usnsToVerify = [usn, ...additionalAttendees.map(a => a.usn)]
        .map(u => (u || "").trim().toUpperCase())
        .filter(Boolean);

      if (usnsToVerify.length !== ticketCount) {
        return NextResponse.json(
          { success: false, error: "All student registrations require a valid USN." },
          { status: 400 }
        );
      }

      // Check for duplicate registrations in approved/pending tickets
      const { data: existingTickets, error: dupCheckError } = await supabaseAdmin
        .from("tickets")
        .select("usn")
        .in("usn", usnsToVerify)
        .in("status", ["pending", "approved"]);

      if (dupCheckError) {
        console.error("Duplicate USN check error:", dupCheckError);
        return NextResponse.json(
          { success: false, error: "Failed to verify database for duplicate USNs." },
          { status: 500 }
        );
      }

      if (existingTickets && existingTickets.length > 0) {
        const duplicateUsns = existingTickets.map(t => t.usn).join(", ");
        return NextResponse.json(
          { success: false, error: `The following USN(s) are already registered: ${duplicateUsns}. Duplicate student bookings are not allowed.` },
          { status: 400 }
        );
      }

      // Verify authorization from authorized_usns table
      const { data: authorizedRows, error: authError } = await supabaseAdmin
        .from("authorized_usns")
        .select("usn")
        .in("usn", usnsToVerify);

      if (authError) {
        console.error("USN authorization check error:", authError);
        return NextResponse.json(
          { success: false, error: "Failed to check USN list for authorization." },
          { status: 500 }
        );
      }

      const authorizedUsnsSet = new Set(authorizedRows?.map(r => r.usn.toUpperCase()) || []);
      const unauthorizedUsns = usnsToVerify.filter(u => !authorizedUsnsSet.has(u));

      if (unauthorizedUsns.length > 0) {
        return NextResponse.json(
          { success: false, error: `The following USN(s) are not pre-authorized for student pricing: ${unauthorizedUsns.join(", ")}. Please review your input or contact support.` },
          { status: 400 }
        );
      }
    }

    // 1. Upload screenshot to Supabase Storage
    const fileExt = screenshot.name.split(".").pop() || "png";
    const randomId = Math.random().toString(36).substring(2, 11);
    const fileName = `screenshots/${Date.now()}-${randomId}.${fileExt}`;
    
    const arrayBuffer = await screenshot.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Auto-create bucket if it doesn't exist yet
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      const bucketExists = buckets?.some((b) => b.id === "payment-screenshots");
      if (!bucketExists) {
        console.log("Bucket 'payment-screenshots' not found. Auto-creating private bucket...");
        const { error: createError } = await supabaseAdmin.storage.createBucket("payment-screenshots", {
          public: false,
        });
        if (createError) {
          console.error("Auto-create bucket error:", createError);
        }
      }
    } catch (err) {
      console.warn("Failed to list/create bucket. Proceeding to upload anyway...", err);
    }

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("payment-screenshots")
      .upload(fileName, buffer, {
        contentType: screenshot.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload payment screenshot." },
        { status: 500 }
      );
    }

    const screenshotPath = uploadData.path;

    // Generate a unique group_id for this multi-ticket transaction
    const groupId = `group_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const individualPrice = pricePaid / ticketCount;

    // Prepare rows for bulk insertion
    const rowsToInsert = [];

    // Add Booker (Attendee 1)
    rowsToInsert.push({
      name,
      email,
      phone,
      category,
      ticket_count: 1, // Split into single ticket rows for distinct check-in/passes
      price_paid: individualPrice,
      screenshot_path: screenshotPath,
      status: "pending",
      clerk_user_id: userId,
      group_id: groupId,
      usn: usn ? usn.trim().toUpperCase() : null,
    });

    // Add Additional Attendees
    for (const att of additionalAttendees) {
      rowsToInsert.push({
        name: att.name,
        email: att.email,
        phone, // Use booker's phone as transaction contact reference
        category,
        ticket_count: 1,
        price_paid: individualPrice,
        screenshot_path: screenshotPath,
        status: "pending",
        clerk_user_id: userId,
        group_id: groupId,
        usn: att.usn ? att.usn.trim().toUpperCase() : null,
      });
    }

    // 2. Bulk insert tickets
    const { data: insertedTickets, error: dbError } = await supabaseAdmin
      .from("tickets")
      .insert(rowsToInsert)
      .select();

    if (dbError || !insertedTickets || insertedTickets.length === 0) {
      console.error("Database bulk insert error:", dbError);
      // Clean up uploaded file if DB insert fails
      await supabaseAdmin.storage.from("payment-screenshots").remove([screenshotPath]);
      return NextResponse.json(
        { success: false, error: "Failed to save registration details." },
        { status: 500 }
      );
    }

    // 3. Send "Pending" confirmation email asynchronously to all attendees
    for (const row of rowsToInsert) {
      try {
        await sendPendingConfirmationEmail(row.email, row.name, {
          category,
          ticketCount: 1,
          pricePaid: row.price_paid,
        });
      } catch (emailErr) {
        console.error(`Nodemailer pending email error for ${row.email}:`, emailErr);
      }
    }

    // Return the main ticket's details for success feedback
    const mainTicket = insertedTickets[0];
    return NextResponse.json({
      success: true,
      ticket: {
        id: mainTicket.id,
        name: mainTicket.name,
        email: mainTicket.email,
        status: mainTicket.status,
      },
    });

  } catch (error) {
    console.error("Register API general error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
