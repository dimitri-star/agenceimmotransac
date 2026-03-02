import Twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? Twilio(accountSid, authToken) : null;

export async function sendSms(to: string, body: string, senderName?: string): Promise<{ sid?: string; error?: string }> {
  if (!client || !fromNumber) {
    return { error: "SMS not configured (TWILIO_*)" };
  }
  try {
    const message = await client.messages.create({
      body,
      from: fromNumber,
      to: to.replace(/\s/g, ""),
    });
    return { sid: message.sid };
  } catch (e) {
    const err = e as Error;
    return { error: err.message };
  }
}
