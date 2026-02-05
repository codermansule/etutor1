import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailProps {
    to: string | string[];
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailProps) {
    try {
        const data = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to,
            subject,
            html,
        });
        return { success: true, data };
    } catch (error) {
        console.error('Error sending email via Resend:', error);
        return { success: false, error };
    }
}

// Pre-defined templates for the platform
export const EmailTemplates = {
    welcome: (name: string) => ({
        subject: "Welcome to ETUTOR! 🚀",
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
        <h1 style="color: #0ea5e9;">Welcome to ETUTOR, ${name}!</h1>
        <p>Your journey to elite learning starts here. You've officially joined a community of expert tutors and AI-powered learning tools.</p>
        <p>Ready to start? <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://etutor.studybitests.com'}/student" style="color: #0ea5e9; font-weight: bold;">Log in to your dashboard</a></p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">Level up your skills with AI-powered study plans and live vector-search classrooms.</p>
      </div>
    `
    }),

    badgeEarned: (name: string, badgeName: string) => ({
        subject: `You earned a new badge! 🏆`,
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #334155; text-align: center;">
        <h1 style="color: #10b981;">Congratulations ${name}!</h1>
        <p>You've just earned the <strong>${badgeName}</strong> badge.</p>
        <div style="font-size: 40px; margin: 20px 0;">🏆</div>
        <p>Keep up the great work! Your streak is growing.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">ETUTOR Gamification Engine - Keep learning, keep earning.</p>
      </div>
    `
    })
};
