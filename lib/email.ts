import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST || "";
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER || "";
const smtpPassword = process.env.SMTP_PASSWORD || "";
const smtpFromEmail = process.env.SMTP_FROM_EMAIL || `"TEDxICEAS" <tedxiceas@gmail.com>`;

const getTransporter = () => {
  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.warn("SMTP environment variables are missing. Email sending will be logged to console instead.");
    return null;
  }
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
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
        If you have any questions or made a mistake in your details, feel free to contact our team by replying to this email or calling Rayif at +91 97464 02973.
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

export async function sendApprovedTicketEmail(
  toEmail: string,
  name: string,
  ticketCode: string,
  details: EmailDetails
) {
  const transporter = getTransporter();
  const subject = "Your TEDxICEAS Official Entry Ticket Confirmed! 🎟️";
  
  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; color: #333333;">
      <div style="text-align: center; border-bottom: 2px solid #EB0028; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="color: #000000; font-size: 28px; margin: 0; font-weight: bold; letter-spacing: -0.5px;">TEDx<span style="color: #EB0028;">ICEAS</span></h1>
        <p style="color: #666666; font-size: 14px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Ideas Worth Spreading</p>
      </div>
      
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="display: inline-block; background-color: #fff0f1; border: 2px dashed #EB0028; padding: 20px 30px; border-radius: 8px; margin: 10px 0;">
          <p style="font-size: 13px; text-transform: uppercase; color: #666666; margin: 0 0 10px 0; letter-spacing: 1px; font-weight: bold;">Your Ticket Entry QR Code</p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${ticketCode}" alt="Ticket Entry QR Code" style="display: block; margin: 10px auto; width: 160px; height: 160px; border: 4px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
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

  await transporter.sendMail({
    from: smtpFromEmail,
    to: toEmail,
    subject,
    html: htmlContent,
  });
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
        If you believe this is an error or need assistance, please contact Rayif at +91 97464 02973 or reply to this email.
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
        <p style="color: #666666; font-size: 14px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Ideas Worth Spreading</p>
      </div>
      
      <h2 style="color: #000000; font-size: 20px; margin-top: 0;">Welcome, ${name}!</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #555555;">
        We are thrilled to have you join us at <strong>TEDxICEAS</strong>! Your entry has been checked in and verified at the registration desk.
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #555555; margin-bottom: 8px;">
        Below is the official schedule and event flow for today. We hope you have an inspiring and thought-provoking experience!
      </p>
      
      <div style="background-color: #f9f9f9; border-left: 4px solid #EB0028; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #000000; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 12px;">Event Flow Schedule</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; font-weight: bold; color: #EB0028; width: 180px;">09:00 AM - 09:30 AM</td>
            <td style="padding: 8px 0; color: #333333;">Registration & Welcome Kit Distribution</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; font-weight: bold; color: #EB0028;">09:30 AM - 10:00 AM</td>
            <td style="padding: 8px 0; color: #333333;">Opening Ceremony & Lamp Lighting</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; font-weight: bold; color: #EB0028;">10:00 AM - 11:30 AM</td>
            <td style="padding: 8px 0; color: #333333;"><strong>Session 1: Unleashing Innovation</strong><br/><span style="color:#666; font-size:12px;">3 Talks & Interactive Q&A</span></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; font-weight: bold; color: #EB0028;">11:30 AM - 12:00 PM</td>
            <td style="padding: 8px 0; color: #333333;">Networking Coffee Break ☕</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; font-weight: bold; color: #EB0028;">12:00 PM - 01:30 PM</td>
            <td style="padding: 8px 0; color: #333333;"><strong>Session 2: Breaking Barriers</strong><br/><span style="color:#666; font-size:12px;">3 Talks & Panel Discussion</span></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; font-weight: bold; color: #EB0028;">01:30 PM - 02:30 PM</td>
            <td style="padding: 8px 0; color: #333333;">Networking Lunch Break 🍽️</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px 0; font-weight: bold; color: #EB0028;">02:30 PM - 04:00 PM</td>
            <td style="padding: 8px 0; color: #333333;"><strong>Session 3: The Future Paradigm</strong><br/><span style="color:#666; font-size:12px;">3 Talks & Concluding Thoughts</span></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #EB0028;">04:00 PM - 04:30 PM</td>
            <td style="padding: 8px 0; color: #333333;">Closing Ceremony & Valedictory</td>
          </tr>
        </table>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; color: #555555;">
        Your ticket also contains a <strong>Food Pass</strong> and <strong>Goodie Pass</strong>. Please present your ticket QR code at the respective food and kit counters to claim them.
      </p>
      
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
