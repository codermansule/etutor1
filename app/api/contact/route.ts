import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/notifications/email-service";
import { captureError } from "@/lib/monitoring/sentry";
import { contactFormSchema, parseBody } from "@/lib/validations/api-schemas";

export async function POST(req: Request) {
  try {
    const parsed = parseBody(contactFormSchema, await req.json());
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error }, { status: 400 });

    const { name, email, subject, message } = parsed.data;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">New Contact Form Submission</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #64748b;">Name</td><td style="padding: 8px 0;">${name}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #64748b;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #64748b;">Subject</td><td style="padding: 8px 0;">${subject}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p style="white-space: pre-wrap; color: #334155;">${message}</p>
      </div>
    `;

    const result = await sendEmail({
      to: process.env.CONTACT_EMAIL || "support@etutor.studybitests.com",
      subject: `[Contact Form] ${subject}`,
      html,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    captureError(error, { route: "POST /api/contact" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
