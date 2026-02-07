import { NextResponse } from 'next/server';
import { sendEmail, EmailTemplates } from '@/lib/notifications/email-service';
import { captureError } from '@/lib/monitoring/sentry';
import { welcomeEmailSchema, parseBody } from '@/lib/validations/api-schemas';

export async function POST(req: Request) {
    try {
        const parsed = parseBody(welcomeEmailSchema, await req.json());
        if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
        const { email, fullName } = parsed.data;

        const template = EmailTemplates.welcome(fullName);
        const result = await sendEmail({
            to: email,
            subject: template.subject,
            html: template.html,
        });

        if (!result.success) {
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        captureError(error, { route: 'POST /api/auth/welcome-email' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
