import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

interface SendEmailProps {
    to: string | string[];
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailProps) {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'onboarding@etutor.studybitests.com',
            to: Array.isArray(to) ? to.join(', ') : to,
            subject,
            html,
        });
        return { success: true, data: info };
    } catch (error) {
        console.error('Error sending email via SMTP:', error);
        return { success: false, error };
    }
}

// Pre-defined templates for the platform
export const EmailTemplates = {
    welcome: (name: string) => ({
        subject: "Welcome to ETUTOR!",
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
        <h1 style="color: #0ea5e9;">Welcome to ETUTOR, ${name}!</h1>
        <p>Your journey to elite learning starts here. You've officially joined a community of expert tutors and AI-powered learning tools.</p>
        <p>Ready to start? <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://etutor.studybitests.com'}/student" style="color: #0ea5e9; font-weight: bold;">Go to your dashboard</a></p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">Level up your skills with AI-powered study plans and live vector-search classrooms.</p>
      </div>
    `
    }),

    badgeEarned: (name: string, badgeName: string) => ({
        subject: `You earned a new badge!`,
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #334155; text-align: center;">
        <h1 style="color: #10b981;">Congratulations ${name}!</h1>
        <p>You've just earned the <strong>${badgeName}</strong> badge.</p>
        <p>Keep up the great work! Your streak is growing.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">ETUTOR Gamification Engine - Keep learning, keep earning.</p>
      </div>
    `
    })
};
