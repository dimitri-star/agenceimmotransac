/**
 * WhatsApp sending stub.
 * No API call until a provider is configured (Twilio WhatsApp or Meta Cloud API).
 * Writes a Message row with channel WHATSAPP and status SKIPPED_NO_PROVIDER for history.
 */

import { prisma } from "@/lib/db";
import { SequenceChannel, MessageDirection } from "@/generated/prisma";

export async function sendWhatsApp(
  leadId: string,
  phone: string,
  body: string,
  _templateId?: string
): Promise<{ messageId?: string; skipped?: boolean; error?: string }> {
  if (!prisma) {
    return { error: "Database not configured" };
  }
  try {
    const message = await prisma.message.create({
      data: {
        leadId,
        channel: "WHATSAPP" as SequenceChannel,
        direction: "OUTBOUND" as MessageDirection,
        content: body,
        status: "SKIPPED_NO_PROVIDER",
      },
    });
    return { messageId: message.id, skipped: true };
  } catch (e) {
    const err = e as Error;
    return { error: err.message };
  }
}
