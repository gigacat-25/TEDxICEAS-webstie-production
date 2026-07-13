import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendPendingConfirmationEmail } from "@/lib/email";
import { auth } from "@clerk/nextjs/server";

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

    if (!name || !email || !phone || !category || !ticketCountStr || !pricePaidStr || !screenshot) {
      return NextResponse.json(
        { success: false, error: "Missing required fields or file." },
        { status: 400 }
      );
    }

    const ticketCount = parseInt(ticketCountStr, 10);
    const pricePaid = parseFloat(pricePaidStr);

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format." },
        { status: 400 }
      );
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

    // 2. Insert ticket registration into Supabase database (with clerk_user_id)
    const { data: ticketData, error: dbError } = await supabaseAdmin
      .from("tickets")
      .insert({
        name,
        email,
        phone,
        category,
        ticket_count: ticketCount,
        price_paid: pricePaid,
        screenshot_path: screenshotPath,
        status: "pending",
        clerk_user_id: userId,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      // Clean up uploaded file if DB insert fails
      await supabaseAdmin.storage.from("payment-screenshots").remove([screenshotPath]);
      return NextResponse.json(
        { success: false, error: "Failed to save registration details." },
        { status: 500 }
      );
    }

    // 3. Send "Pending" confirmation email asynchronously
    try {
      await sendPendingConfirmationEmail(email, name, {
        category,
        ticketCount,
        pricePaid,
      });
    } catch (emailErr) {
      // Don't fail the request if only the email fails, but log it
      console.error("Nodemailer pending email error:", emailErr);
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticketData.id,
        name: ticketData.name,
        email: ticketData.email,
        status: ticketData.status,
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
