/**
 * Calendly integration: default booking URL and optional API for single-use links.
 * Uses CALENDLY_TOKEN (OAuth or personal token) and agency calendlyOrgUri / calendlyEventType.
 * @see https://developer.calendly.com/api-docs
 */

export type CalendlyAgency = {
  calendlyToken?: string | null;
  calendlyOrgUri?: string | null;
  calendlyEventType?: string | null;
};

const CALENDLY_API = "https://api.calendly.com";

/**
 * Returns the default booking URL for the agency.
 * If calendlyEventType is a full URL (https://calendly.com/...), use it.
 * Otherwise we could build from org + event type via API; for MVP we require a full URL in settings.
 */
export function getDefaultBookingUrl(agency: CalendlyAgency): string | null {
  const url = agency.calendlyEventType?.trim();
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://calendly.com/${url}`;
}

/**
 * Fetches current user's event types (requires valid token).
 * Use to populate event type dropdown in settings.
 */
export async function listEventTypes(agency: CalendlyAgency): Promise<{ uri: string; name: string; slug: string; bookingUrl: string }[]> {
  const token = agency.calendlyToken;
  if (!token) return [];
  try {
    const me = await fetch(`${CALENDLY_API}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!me.ok) return [];
    const user = await me.json();
    const eventTypesUrl = user.resource?.event_types_uri ?? `${CALENDLY_API}/event_types?user=${encodeURIComponent(user.resource?.uri ?? "")}`;
    const res = await fetch(eventTypesUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.collection ?? [];
    return items.map((et: { uri: string; name: string; slug: string }) => ({
      uri: et.uri,
      name: et.name,
      slug: et.slug,
      bookingUrl: `https://calendly.com/${user.resource?.scheduling_url?.replace(/^https?:\/\/calendly\.com\//, "") ?? ""}/${et.slug}`.replace(/\/\//g, "/"),
    }));
  } catch {
    return [];
  }
}

/**
 * Creates a single-use scheduling link (optional; for personalized links).
 * Requires token and event type URI (from listEventTypes or agency config).
 */
export async function createSchedulingLink(
  agency: CalendlyAgency,
  eventTypeUri: string,
  maxEventCount = 1
): Promise<{ bookingUrl: string } | null> {
  const token = agency.calendlyToken;
  if (!token) return null;
  try {
    const res = await fetch(`${CALENDLY_API}/scheduling_links`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        max_event_count: maxEventCount,
        owner: eventTypeUri,
        owner_type: "EventType",
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const url = data.resource?.booking_url;
    return url ? { bookingUrl: url } : null;
  } catch {
    return null;
  }
}

/**
 * Send Calendly booking link to a lead (SMS, Email, WhatsApp stub) and record on lead.
 * Call when lead is QUALIFIED + HOT. Uses getDefaultBookingUrl(agency).
 */
export async function sendCalendlyToLead(leadId: string): Promise<{ sent: boolean; bookingUrl: string | null }> {
  const { prisma } = await import("@/lib/db");
  const { sendSms } = await import("@/lib/sms");
  const { sendEmail } = await import("@/lib/email");
  const { sendWhatsApp } = await import("@/lib/whatsapp");
  const PrismaEnums = await import("@/generated/prisma");
  const { ActivityType } = PrismaEnums;

  if (!prisma) return { sent: false, bookingUrl: null };
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { agency: true, assignedTo: { select: { name: true } } },
  });
  if (!lead) return { sent: false, bookingUrl: null };
  const bookingUrl = getDefaultBookingUrl(lead.agency);
  if (!bookingUrl) return { sent: false, bookingUrl: null };

  const msg = `Bonjour ${lead.firstName}, réservez votre créneau de visite ici : ${bookingUrl}`;
  const emailHtml = `<p>Bonjour ${lead.firstName},</p><p>Réservez votre créneau de visite en cliquant sur le lien ci-dessous :</p><p><a href="${bookingUrl}">${bookingUrl}</a></p>`;
  await sendSms(lead.phone, msg);
  await prisma.message.create({
    data: {
      leadId: lead.id,
      channel: PrismaEnums.SequenceChannel.SMS,
      direction: PrismaEnums.MessageDirection.OUTBOUND,
      content: msg,
      status: "SENT",
    },
  }).catch(() => {});
  await sendEmail(lead.email, "Réservez votre visite", emailHtml, lead.agency?.emailFrom ?? undefined);
  await prisma.message.create({
    data: {
      leadId: lead.id,
      channel: PrismaEnums.SequenceChannel.EMAIL,
      direction: PrismaEnums.MessageDirection.OUTBOUND,
      content: emailHtml,
      status: "SENT",
    },
  }).catch(() => {});
  await sendWhatsApp(lead.id, lead.phone, msg);

  await prisma.activity.create({
    data: {
      leadId: lead.id,
      type: ActivityType.CALENDLY_SENT,
      description: `Lien Calendly envoyé : ${bookingUrl}`,
    },
  });
  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      calendlyLinkSentAt: new Date(),
      calendlyBookingUrl: bookingUrl,
    },
  });
  return { sent: true, bookingUrl };
}
