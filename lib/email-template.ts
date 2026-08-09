/**
 * TEDxICEAS Website-Themed HTML Email Generator
 * Matches the website aesthetic: Dark obsidian background, TED red (#EB0028) accents,
 * glassmorphism borders, crisp typography, custom CTA buttons, attendee QR codes, and personalized attendee details.
 */

export interface BroadcastEmailOptions {
  recipientName: string;
  recipientEmail: string;
  ticketCode?: string | null;
  category?: string | null;
  subject: string;
  title: string;
  message: string;
  ctaText?: string;
  ctaUrl?: string;
  includeQRCode?: boolean;
  qrSrc?: string;
}

export function generateWebsiteThemedEmailHtml(options: BroadcastEmailOptions): string {
  const {
    recipientName,
    ticketCode,
    category,
    title,
    message,
    ctaText,
    ctaUrl,
    includeQRCode = true,
    qrSrc,
  } = options;

  // Replace placeholders in message
  const formattedMessage = message
    .replace(/\{\{\s*name\s*\}\}/gi, recipientName)
    .replace(/\{\{\s*ticket_code\s*\}\}/gi, ticketCode || "N/A")
    .replace(/\{\{\s*category\s*\}\}/gi, category || "Attendee");

  // Convert plain text line breaks to HTML paragraphs
  const paragraphs = formattedMessage
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="font-size: 15px; line-height: 1.7; color: #d1d5db; margin: 0 0 16px 0;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  const year = new Date().getFullYear();

  const ctaButtonHtml = ctaText && ctaUrl ? `
    <div style="text-align: center; margin: 28px 0 20px 0;">
      <a href="${ctaUrl}" target="_blank" style="display: inline-block; background-color: #EB0028; color: #ffffff; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 6px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 14px rgba(235, 0, 40, 0.4);">
        ${ctaText}
      </a>
    </div>
  ` : "";

  const resolvedQrSrc = qrSrc || (ticketCode ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(ticketCode)}` : "");

  const qrSectionHtml = (includeQRCode && ticketCode) ? `
    <div style="text-align: center; margin: 24px 0;">
      <div style="display: inline-block; background-color: #171717; border: 2px dashed #EB0028; padding: 20px 25px; border-radius: 10px;">
        <p style="font-size: 11px; text-transform: uppercase; color: #9ca3af; margin: 0 0 10px 0; letter-spacing: 1.5px; font-weight: 700;">Your Ticket Entry QR Code</p>
        <img src="${resolvedQrSrc}" alt="Ticket Entry QR Code" style="display: block; margin: 0 auto 10px auto; width: 160px; height: 160px; border: 4px solid #ffffff; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);" />
        <p style="font-size: 10px; text-transform: uppercase; color: #6b7280; margin: 8px 0 2px 0; letter-spacing: 1px;">Ticket Code</p>
        <h3 style="font-size: 22px; color: #EB0028; margin: 0; font-family: 'Courier New', Courier, monospace; letter-spacing: 2px; font-weight: 700;">${ticketCode}</h3>
      </div>
    </div>
  ` : "";

  const ticketBadgeHtml = ticketCode ? `
    <div style="background-color: #171717; border: 1px solid #262626; border-left: 4px solid #EB0028; border-radius: 6px; padding: 16px 20px; margin: 24px 0;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="color: #9ca3af; padding: 4px 0; width: 40%;">Attendee:</td>
          <td style="color: #ffffff; font-weight: 600; padding: 4px 0;">${recipientName}</td>
        </tr>
        ${category ? `
        <tr>
          <td style="color: #9ca3af; padding: 4px 0;">Category:</td>
          <td style="color: #ffffff; font-weight: 600; padding: 4px 0;">${category}</td>
        </tr>
        ` : ""}
        <tr>
          <td style="color: #9ca3af; padding: 4px 0;">Ticket Code:</td>
          <td style="color: #EB0028; font-weight: 700; font-family: 'Courier New', Courier, monospace; font-size: 16px; padding: 4px 0; letter-spacing: 1px;">${ticketCode}</td>
        </tr>
      </table>
    </div>
  ` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #ffffff;">
  
  <!-- Main Wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; padding: 40px 10px;">
    <tr>
      <td align="center">
        
        <!-- Email Container Card -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #121212; border: 1px solid #262626; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);">
          
          <!-- Header with Red Glow Accent Bar -->
          <tr>
            <td style="background-color: #000000; padding: 28px 30px; text-align: center; border-bottom: 2px solid #EB0028;">
              <h1 style="color: #ffffff; font-size: 30px; margin: 0; font-weight: 900; letter-spacing: -0.5px; line-height: 1;">
                TED<span style="color: #EB0028;">x</span><span style="font-weight: 400; color: #ffffff;">ICEAS</span>
              </h1>
              <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0 0; text-transform: uppercase; letter-spacing: 3px; font-weight: 600;">
                x = independently organized TED event
              </p>
            </td>
          </tr>

          <!-- Banner / Title Section -->
          ${title ? `
          <tr>
            <td style="background-color: #171717; padding: 20px 30px; border-bottom: 1px solid #262626; text-align: center;">
              <h2 style="color: #ffffff; font-size: 20px; margin: 0; font-weight: 700; letter-spacing: -0.3px;">
                ${title}
              </h2>
            </td>
          </tr>
          ` : ""}

          <!-- Body Content Area -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 16px; font-weight: 600; color: #ffffff; margin: 0 0 18px 0;">
                Hello ${recipientName},
              </p>

              ${paragraphs}

              ${qrSectionHtml}

              ${ticketBadgeHtml}

              ${ctaButtonHtml}

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #262626;">
                <p style="font-size: 14px; color: #9ca3af; margin: 0; line-height: 1.5;">
                  Best regards,<br/>
                  <strong style="color: #ffffff;">The TEDxICEAS Team</strong>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color: #09090b; padding: 24px 30px; text-align: center; border-top: 1px solid #1f1f23; font-size: 12px; color: #6b7280; line-height: 1.6;">
              <p style="margin: 0 0 10px 0;">
                Official announcement from <a href="https://tedxiceas.in" target="_blank" style="color: #EB0028; text-decoration: none; font-weight: 600;">TEDxICEAS</a>
              </p>
              <p style="margin: 0; color: #4b5563;">
                &copy; ${year} TEDxICEAS. All rights reserved. | Ideas Worth Spreading
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}
