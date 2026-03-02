import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.EMAIL_FROM ?? "noreply@example.com";

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  from?: string
): Promise<{ id?: string; error?: string }> {
  if (!resend) {
    return { error: "Email not configured (RESEND_API_KEY)" };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: from ?? fromEmail,
      to: [to],
      subject,
      html,
    });
    if (error) return { error: error.message };
    return { id: data?.id };
  } catch (e) {
    const err = e as Error;
    return { error: err.message };
  }
}
