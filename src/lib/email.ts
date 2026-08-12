import { Resend } from "resend";

function getResend(warn = true) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (warn) console.warn("[email] RESEND_API_KEY is not set — email skipped.");
    return null;
  }
  return new Resend(key);
}

const from = () =>
  process.env.EMAIL_FROM || "Hospital Recruitment <no-reply@raymora.vercel.app>";

type Mail = {
  to: string;
  subject: string;
  html: string;
};

async function send(mail: Mail) {
  const resend = getResend();
  if (!resend) return { ok: false as const, skipped: true as const };
  try {
    await resend.emails.send({ from: from(), ...mail });
    return { ok: true as const };
  } catch (e) {
    console.error("[email] send failed:", e);
    return { ok: false as const, error: String(e) };
  }
}

export async function sendApplicationReceived(input: {
  to: string;
  name: string;
  jobTitle: string;
}) {
  return send({
    to: input.to,
    subject: `Application received — ${input.jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
            .container { max-width: 512px; margin: 0 auto; }
            .card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            h1 { color: #0d9488; font-size: 24px; margin: 0 0 16px; }
            .content { color: #334159; line-height: 1.6; }
            .content p { margin: 0 0 12px; }
            .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <h1>Application received</h1>
              <div class="content">
                <p>Thank you, <strong>${escapeHtml(input.name)}</strong>.</p>
                <p>We have received your application for <strong>${escapeHtml(input.jobTitle)}</strong>.</p>
                <p>Our recruitment team will review your profile and contact you about the next steps.</p>
                <div class="footer">
                  <p>This is an automated message — please do not reply.</p>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>`,
  });
}

export async function sendStatusUpdate(input: {
  to: string;
  name: string;
  jobTitle: string;
  status: string;
}) {
  const messages: Record<string, { title: string; body: string[] }> = {
    reviewing: {
      title: "Under review",
      body: [
        "Your application is now under review.",
        "We are going through shortlisted profiles and will get back to you soon.",
      ],
    },
    shortlisted: {
      title: "Shortlisted!",
      body: [
        "Good news — you have been shortlisted for the position.",
        "A member of our recruitment team will contact you to arrange the next steps.",
      ],
    },
    rejected: {
      title: "Application status update",
      body: [
        "Thank you for your interest, but we have decided to move forward with other candidates in this round.",
        "We encourage you to apply for future openings with our organization.",
      ],
    },
  };

  const msg = messages[input.status] ?? {
    title: "Status update",
    body: ["Your application status has been updated."],
  };

  return send({
    to: input.to,
    subject: `Application update — ${input.jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
            .container { max-width: 512px; margin: 0 auto; }
            .card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            h1 { color: #0d9488; font-size: 24px; margin: 0 0 16px; }
            .content { color: #334159; line-height: 1.6; }
            .content p { margin: 0 0 12px; }
            .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
            .status-badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <h1>${msg.title}</h1>
              <div class="content">
                <p>Hi <strong>${escapeHtml(input.name)}</strong>,</p>
                <p>Status of your application for <strong>${escapeHtml(input.jobTitle)}</strong>: <strong>${toLabel(input.status)}</strong></p>
                ${msg.body.map((b) => `<p>${escapeHtml(b)}</p>`).join("")}
                <div class="footer">
                  <p>This is an automated message — please do not reply.</p>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>`,
  });
}

function toLabel(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
