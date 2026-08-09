import nodemailer from "nodemailer";
import { generateWebsiteThemedEmailHtml } from "./email-template";

const smtpHost = process.env.SMTP_HOST || "";
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER || "";
const smtpPassword = process.env.SMTP_PASSWORD || "";
const smtpFromEmail = process.env.SMTP_FROM_EMAIL || `"TEDxICEAS" <tedxiceas@gmail.com>`;

export const getTransporter = () => {
  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.warn("SMTP environment variables are missing. Email sending will be logged to console instead.");
    return null;
  }
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    pool: true, // Use SMTP pooling for fast bulk email sending
    maxConnections: 5,
    maxMessages: 100,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });
};

interface EmailDetails {
  category: string;
  ticketCount: number;
  pricePaid: number;
}

export async function sendPendingConfirmationEmail(
  toEmail: string,
  name: string,
  details: EmailDetails
) {
  const transporter = getTransporter();
  const subject = "Registration Received - Payment Verification Pending | TEDxICEAS";
  
  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; color: #333333;">
      <div style="text-align: center; border-bottom: 2px solid #EB0028; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="color: #000000; font-size: 28px; margin: 0; font-weight: bold; letter-spacing: -0.5px;">TEDx<span style="color: #EB0028;">ICEAS</span></h1>
        <p style="color: #666666; font-size: 14px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Ideas Worth Spreading</p>
      </div>
      
      <h2 style="color: #000000; font-size: 20px; margin-top: 0;">Hello ${name},</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #555555;">
        Thank you for registering for <strong>TEDxICEAS</strong>! We have successfully received your registration details and payment screenshot.
      </p>
      
      <div style="background-color: #f9f9f9; border-left: 4px solid #EB0028; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #000000; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Order Details Summary</h3>
        <table style="width: 100%; font-size: 15px; line-height: 1.5;">
          <tr>
            <td style="color: #666666; width: 40%; padding: 4px 0;">Category:</td>
            <td style="font-weight: bold; color: #333333;">${details.category}</td>
          </tr>
          <tr>
            <td style="color: #666666; padding: 4px 0;">Quantity:</td>
            <td style="font-weight: bold; color: #333333;">${details.ticketCount}</td>
          </tr>
          <tr>
            <td style="color: #666666; padding: 4px 0;">Total Paid:</td>
            <td style="font-weight: bold; color: #EB0028;">₹${details.pricePaid}</td>
          </tr>
        </table>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; color: #555555;">
        Our team is currently verifying your payment screenshot. Once confirmed, you will receive a follow-up email containing your official e-ticket and entry code. This verification process typically takes <strong>1-2 days</strong>.
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #555555;">
        If you have any questions or made a mistake in your details, feel free to contact our team by replying to this email or calling Thejaswin P at +91 98457 14699.
      </p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888888; font-size: 12px; line-height: 1.4;">
        <p style="margin: 0 0 10px 0;">This is an automated notification. Please do not reply directly to this message unless you need support.</p>
        <p style="margin: 0; font-weight: bold; color: #555555;">&copy; ${new Date().getFullYear()} TEDxICEAS. All rights reserved.</p>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log(`[SMTP SIMULATION] Send pending confirmation to ${toEmail}. Details:`, { name, details });
    return;
  }

  await transporter.sendMail({
    from: smtpFromEmail,
    to: toEmail,
    subject,
    html: htmlContent,
  });
}

// In-memory cache for QR code buffers to speed up bulk email dispatches
const qrCodeCache = new Map<string, Buffer>();

// Fetch QR code image from API as a buffer with fast timeout and caching
async function fetchQRCodeBuffer(ticketCode: string): Promise<Buffer | null> {
  if (!ticketCode) return null;
  if (qrCodeCache.has(ticketCode)) {
    return qrCodeCache.get(ticketCode)!;
  }

  const url = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(ticketCode)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    qrCodeCache.set(ticketCode, buffer);
    return buffer;
  } catch (err) {
    console.warn(`Failed or timed out fetching QR code buffer for ticket ${ticketCode}, falling back to image URL.`);
    return null;
  }
}

export async function sendApprovedTicketEmail(
  toEmail: string,
  name: string,
  ticketCode: string,
  details: EmailDetails
) {
  const transporter = getTransporter();
  const subject = "Your TEDxICEAS Official Entry Ticket Confirmed! 🎟️";
  
  const qrBuffer = await fetchQRCodeBuffer(ticketCode);
  const qrSrc = qrBuffer ? "cid:qrcode_image" : `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${ticketCode}`;

  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; color: #333333;">
      <div style="text-align: center; border-bottom: 2px solid #EB0028; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="color: #000000; font-size: 28px; margin: 0; font-weight: bold; letter-spacing: -0.5px;">TEDx<span style="color: #EB0028;">ICEAS</span></h1>
        <p style="color: #666666; font-size: 14px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Ideas Worth Spreading</p>
      </div>
      
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="display: inline-block; background-color: #fff0f1; border: 2px dashed #EB0028; padding: 20px 30px; border-radius: 8px; margin: 10px 0;">
          <p style="font-size: 13px; text-transform: uppercase; color: #666666; margin: 0 0 10px 0; letter-spacing: 1px; font-weight: bold;">Your Ticket Entry QR Code</p>
          <img src="${qrSrc}" alt="Ticket Entry QR Code" style="display: block; margin: 10px auto; width: 160px; height: 160px; border: 4px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
          <p style="font-size: 11px; text-transform: uppercase; color: #888888; margin: 12px 0 2px 0; letter-spacing: 1px;">Ticket Code String</p>
          <h2 style="font-size: 26px; color: #EB0028; margin: 0; font-family: monospace; letter-spacing: 2px; font-weight: bold;">${ticketCode}</h2>
        </div>
      </div>

      <h2 style="color: #000000; font-size: 20px; margin-top: 0; text-align: left;">Congratulations ${name}!</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #555555;">
        Your payment has been successfully verified! Your registration for <strong>TEDxICEAS</strong> is now officially confirmed. Your entry ticket details are below.
      </p>
      
      <div style="background-color: #f9f9f9; border-left: 4px solid #000000; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #000000; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Ticket Details</h3>
        <table style="width: 100%; font-size: 15px; line-height: 1.5;">
          <tr>
            <td style="color: #666666; width: 40%; padding: 4px 0;">Attendee Name:</td>
            <td style="font-weight: bold; color: #333333;">${name}</td>
          </tr>
          <tr>
            <td style="color: #666666; padding: 4px 0;">Category:</td>
            <td style="font-weight: bold; color: #333333;">${details.category}</td>
          </tr>
          <tr>
            <td style="color: #666666; padding: 4px 0;">Quantity:</td>
            <td style="font-weight: bold; color: #333333;">${details.ticketCount} Ticket(s)</td>
          </tr>
          <tr>
            <td style="color: #666666; padding: 4px 0;">Ticket Code:</td>
            <td style="font-weight: bold; color: #EB0028; font-family: monospace;">${ticketCode}</td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: #fffcf5; border: 1px solid #f1e0b5; border-radius: 4px; padding: 12px 15px; margin: 20px 0; font-size: 14px; color: #856404; line-height: 1.5;">
        <strong>Important Instructions:</strong>
        <ul style="margin: 5px 0 0 0; padding-left: 20px;">
          <li>Please keep this email or a screenshot of the ticket code handy at the registration desk on the day of the event.</li>
          ${details.category.toLowerCase().includes("student") ? "<li><strong>Crucial:</strong> Since you bought a Student ticket, you MUST present a valid student ID card at the entrance. Failure to do so will void the ticket.</li>" : ""}
          <li>Tickets are non-transferable and non-refundable.</li>
        </ul>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; color: #555555;">
        We are thrilled to welcome you to TEDxICEAS. Get ready to interact with an exceptional lineup of speakers and fellow participants!
      </p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888888; font-size: 12px; line-height: 1.4;">
        <p style="margin: 0; font-weight: bold; color: #555555;">&copy; ${new Date().getFullYear()} TEDxICEAS. All rights reserved.</p>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log(`[SMTP SIMULATION] Send approved ticket to ${toEmail}. Code: ${ticketCode}. Details:`, { name, details });
    return;
  }

  const mailOptions: any = {
    from: smtpFromEmail,
    to: toEmail,
    subject,
    html: htmlContent,
  };

  if (qrBuffer) {
    mailOptions.attachments = [
      {
        filename: "qrcode.png",
        content: qrBuffer,
        cid: "qrcode_image",
      },
    ];
  }

  await transporter.sendMail(mailOptions);
}

export async function sendRejectedEmail(
  toEmail: string,
  name: string,
  reason: string
) {
  const transporter = getTransporter();
  const subject = "Update Regarding Your TEDxICEAS Registration Request";
  
  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; color: #333333;">
      <div style="text-align: center; border-bottom: 2px solid #EB0028; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="color: #000000; font-size: 28px; margin: 0; font-weight: bold; letter-spacing: -0.5px;">TEDx<span style="color: #EB0028;">ICEAS</span></h1>
        <p style="color: #666666; font-size: 14px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Ideas Worth Spreading</p>
      </div>
      
      <h2 style="color: #000000; font-size: 20px; margin-top: 0;">Hello ${name},</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #555555;">
        Thank you for your interest in registering for <strong>TEDxICEAS</strong>. 
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #555555;">
        Unfortunately, our verification team was unable to confirm your payment screenshot. Below is the reason provided by the administrator:
      </p>
      
      <div style="background-color: #fff5f5; border-left: 4px solid #EB0028; padding: 15px; margin: 20px 0; border-radius: 4px; color: #c53030; font-size: 15px; font-weight: 500;">
        ${reason || "The uploaded payment screenshot was blank, illegible, or the transaction could not be verified in our bank statement."}
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; color: #555555;">
        <strong>What should you do?</strong>
        <br/>
        Please check your payment transaction status in your UPI app. If the transaction was successful, you can re-register on our website with a clear, full screenshot showing the Transaction ID/UTR and the recipient details. 
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #555555;">
        If you believe this is an error or need assistance, please contact Thejaswin P at +91 98457 14699 or reply to this email.
      </p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888888; font-size: 12px; line-height: 1.4;">
        <p style="margin: 0; font-weight: bold; color: #555555;">&copy; ${new Date().getFullYear()} TEDxICEAS. All rights reserved.</p>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log(`[SMTP SIMULATION] Send rejected email to ${toEmail}. Reason: ${reason}`);
    return;
  }

  await transporter.sendMail({
    from: smtpFromEmail,
    to: toEmail,
    subject,
    html: htmlContent,
  });
}

export async function sendEventFlowEmail(toEmail: string, name: string) {
  const transporter = getTransporter();
  const subject = "Welcome to TEDxICEAS! Here is your Event Flow & Schedule 📅";
  
  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; color: #333333;">
      <div style="text-align: center; border-bottom: 2px solid #EB0028; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="color: #000000; font-size: 28px; margin: 0; font-weight: bold; letter-spacing: -0.5px;">TEDx<span style="color: #EB0028;">ICEAS</span></h1>
        <p style="color: #666666; font-size: 14px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">What Shapes Us</p>
      </div>
      
      <h2 style="color: #000000; font-size: 20px; margin-top: 0;">Welcome, ${name}!</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #555555;">
        We are thrilled to have you join us at <strong>TEDxICEAS</strong>! Your entry has been checked in and verified at the registration desk.
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #555555; margin-bottom: 12px;">
        Below is the official schedule and event flow for today. You can also view the full interactive roadmap at <a href="https://tedxiceas.in/roadmap" style="color: #EB0028; font-weight: bold; text-decoration: underline;">tedxiceas.in/roadmap</a>.
      </p>
      
      <div style="background-color: #f9f9f9; border-left: 4px solid #EB0028; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #000000; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 12px;">Event Flow Schedule</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.5;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 6px 0; font-weight: bold; color: #EB0028; width: 100px;">09:30 AM</td>
            <td style="padding: 6px 0; color: #333333;">Welcome + Introduction</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 6px 0; font-weight: bold; color: #EB0028;">09:35 AM</td>
            <td style="padding: 6px 0; color: #333333;">Lighting the Lamp</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 6px 0; font-weight: bold; color: #EB0028;">09:40 AM</td>
            <td style="padding: 6px 0; color: #333333;">Introduction to TEDx</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 6px 0; font-weight: bold; color: #EB0028;">09:58 AM</td>
            <td style="padding: 6px 0; color: #333333;">Talk by <strong>Paul Mathulla</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 6px 0; font-weight: bold; color: #EB0028;">10:16 AM</td>
            <td style="padding: 6px 0; color: #333333;">Talk by <strong>Shwetha Vohra</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 6px 0; font-weight: bold; color: #EB0028;">10:34 AM</td>
            <td style="padding: 6px 0; color: #333333;">Talk by <strong>Dr. Lokesh</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 6px 0; font-weight: bold; color: #EB0028;">10:52 AM</td>
            <td style="padding: 6px 0; color: #333333;">Game: TEDx Bingo Cards 🎮</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee; background-color: #f0fdf4;">
            <td style="padding: 6px 8px; font-weight: bold; color: #50B848;">11:02 AM</td>
            <td style="padding: 6px 8px; color: #15803d; font-weight: bold;">Monster Energy Break ⚡</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 6px 0; font-weight: bold; color: #EB0028;">11:12 AM</td>
            <td style="padding: 6px 0; color: #333333;">Talk by <strong>Kapil Ahuja</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 6px 0; font-weight: bold; color: #EB0028;">11:30 AM</td>
            <td style="padding: 6px 0; color: #333333;">Talk by <strong>Dr. Ghazala Ahmed Shafi</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 6px 0; font-weight: bold; color: #EB0028;">11:48 AM</td>
            <td style="padding: 6px 0; color: #333333;">Talk by <strong>Sanjay R</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 6px 0; font-weight: bold; color: #EB0028;">12:06 PM</td>
            <td style="padding: 6px 0; color: #333333;">Dance Performance by <strong>Ankitha, Gowri, Anushka</strong> 💃</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 6px 0; font-weight: bold; color: #EB0028;">12:14 PM</td>
            <td style="padding: 6px 0; color: #333333;">Talk by <strong>Arun Prasanna</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee; background-color: #fff1f2;">
            <td style="padding: 6px 8px; font-weight: bold; color: #EB0028;">12:32 PM</td>
            <td style="padding: 6px 8px; color: #9f1239; font-weight: bold;">Lunch Break 🍽️</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 6px 0; font-weight: bold; color: #EB0028;">02:00 PM</td>
            <td style="padding: 6px 0; color: #333333;">Talk by <strong>Manish Kankaria</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 6px 0; font-weight: bold; color: #EB0028;">02:18 PM</td>
            <td style="padding: 6px 0; color: #333333;">Talk by <strong>Dr. Saheer Nelliparamban</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 6px 0; font-weight: bold; color: #EB0028;">02:36 PM</td>
            <td style="padding: 6px 0; color: #333333;">Talk by <strong>Neole Anna Cornelio</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 6px 0; font-weight: bold; color: #EB0028;">02:54 PM</td>
            <td style="padding: 6px 0; color: #333333;">Talk by <strong>Fazlur Rahman Khan</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 6px 0; font-weight: bold; color: #EB0028;">03:12 PM</td>
            <td style="padding: 6px 0; color: #333333;">Talk by <strong>Huda Thamanna</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee; background-color: #fefce8;">
            <td style="padding: 6px 8px; font-weight: bold; color: #d97706;">03:30 PM</td>
            <td style="padding: 6px 8px; color: #92400e; font-weight: bold;">Snack Break 🍿</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #EB0028;">03:50 PM</td>
            <td style="padding: 6px 0; color: #333333;">Music Performance by <strong>Karthik Boon</strong> 🎵</td>
          </tr>
        </table>
      </div>
      
      <p style="font-size: 15px; line-height: 1.6; color: #555555;">
        Your ticket also contains a <strong>Food Pass</strong> and <strong>Goodie Pass</strong>. Please present your ticket QR code at the respective food and kit counters to claim them.
      </p>

      <div style="background-color: #fffcf5; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #000000; font-size: 16px; border-bottom: 1px solid #fef3c7; padding-bottom: 8px; margin-bottom: 12px;">🏛️ Venue Rules, Safety & Attendee Code of Conduct</h3>
        <ol style="margin: 0; padding-left: 18px; font-size: 13px; color: #4b5563; line-height: 1.6;">
          <li style="margin-bottom: 6px;"><strong>Photography & Videography:</strong> The event is professionally recorded. By entering, attendees consent to their likeness being used in official TEDxICEAS media.</li>
          <li style="margin-bottom: 6px;"><strong>Emergency & Safety:</strong> Follow staff/security instructions immediately in emergencies. Keep exits unobstructed.</li>
          <li style="margin-bottom: 6px;"><strong>Restricted Items:</strong> Weapons, alcohol, smoking, fireworks, drones, laser pointers & hazardous materials are strictly prohibited.</li>
          <li style="margin-bottom: 6px;"><strong>Food & Beverages:</strong> Outside food is restricted inside the main auditorium. Please use designated refreshment zones during breaks.</li>
          <li style="margin-bottom: 6px;"><strong>Mobile Etiquette:</strong> Keep phones on silent during talks. Calls must be taken outside the auditorium.</li>
          <li style="margin-bottom: 6px;"><strong>Respect for Speakers:</strong> Interruptions, shouting, or disruptive behavior during talks are strictly prohibited.</li>
          <li style="margin-bottom: 6px;"><strong>Seating & Entry:</strong> Seating is first-come, first-served. Late arrivals will enter during appropriate session breaks.</li>
          <li style="margin-bottom: 6px;"><strong>Lost & Found & Valuables:</strong> You are solely responsible for your personal belongings. Misplaced items can be reported at the Help Desk.</li>
          <li style="margin-bottom: 6px;"><strong>Environmental Responsibility:</strong> Please keep the venue clean and dispose of waste in designated recycling bins.</li>
          <li style="margin-bottom: 6px;"><strong>Staff Authority & Property Protection:</strong> Comply with all staff/volunteer instructions. College property must be protected; damage will lead to immediate eviction & financial liability.</li>
        </ol>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #78350f;">
          For full legal details, visit <a href="https://tedxiceas.in/terms" style="color: #EB0028; font-weight: bold;">tedxiceas.in/terms</a>.
        </p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888888; font-size: 12px; line-height: 1.4;">
        <p style="margin: 0; font-weight: bold; color: #555555;">&copy; ${new Date().getFullYear()} TEDxICEAS. All rights reserved.</p>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log(`[SMTP SIMULATION] Send event flow email to ${toEmail} for ${name}`);
    return;
  }

  await transporter.sendMail({
    from: smtpFromEmail,
    to: toEmail,
    subject,
    html: htmlContent,
  });
}

export async function sendCustomBroadcastEmail(options: {
  toEmail: string;
  name: string;
  ticketCode?: string | null;
  category?: string | null;
  subject: string;
  title: string;
  message: string;
  ctaText?: string;
  ctaUrl?: string;
  includeQRCode?: boolean;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
  transporter?: any;
}) {
  const transporter = options.transporter || getTransporter();
  const shouldIncludeQR = options.includeQRCode !== false && Boolean(options.ticketCode);
  
  let qrBuffer: Buffer | null = null;
  let qrSrc: string | undefined = undefined;

  if (shouldIncludeQR && options.ticketCode) {
    qrBuffer = await fetchQRCodeBuffer(options.ticketCode);
    if (qrBuffer) {
      qrSrc = "cid:qrcode_image";
    }
  }

  const htmlContent = generateWebsiteThemedEmailHtml({
    recipientName: options.name,
    recipientEmail: options.toEmail,
    ticketCode: options.ticketCode,
    category: options.category,
    subject: options.subject,
    title: options.title,
    message: options.message,
    ctaText: options.ctaText,
    ctaUrl: options.ctaUrl,
    includeQRCode: shouldIncludeQR,
    qrSrc,
  });

  if (!transporter) {
    console.log(`[SMTP SIMULATION] Send broadcast email to ${options.toEmail}. Subject: ${options.subject}. QR: ${shouldIncludeQR}. Attachments: ${options.attachments?.length || 0}`);
    return;
  }

  const formattedAttachments: any[] = options.attachments?.map((att) => ({
    filename: att.filename,
    content: typeof att.content === "string" ? Buffer.from(att.content, "base64") : att.content,
    contentType: att.contentType,
  })) || [];

  if (qrBuffer) {
    formattedAttachments.push({
      filename: "qrcode.png",
      content: qrBuffer,
      cid: "qrcode_image",
    });
  }

  await transporter.sendMail({
    from: smtpFromEmail,
    to: options.toEmail,
    subject: options.subject,
    html: htmlContent,
    attachments: formattedAttachments,
  });
}

