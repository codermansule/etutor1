import { NextResponse } from 'next/server';
import { sendEmail, EmailTemplates } from '@/lib/notifications/email-service';
import { captureError } from '@/lib/monitoring/sentry';

export async function POST(req: Request) {
    try {
        const { email, fullName } = await req.json();

        if (!email || !fullName) {
            return NextResponse.json({ error: 'Missing email or name' }, { status: 400 });
        }

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
