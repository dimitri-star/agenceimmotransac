import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type RelanceItem = {
  leadId: string;
  firstName: string;
  lastName: string;
  propertyAddress: string;
  type: string;
  lastActionAt: string | null;
  heatScore: number | null;
  suggestedAction: string;
};

export async function GET() {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user?.agencyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Base de données non configurée" }, { status: 503 });
  }
  const agencyId = user.agencyId;
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const xDaysAgo = new Date(now);
  xDaysAgo.setDate(xDaysAgo.getDate() - 5);

  const allLeads = await prisma.lead.findMany({
    where: { agencyId, status: { not: "LOST" } },
    include: {
      messages: { orderBy: { sentAt: "desc" }, take: 1 },
      activities: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const noResponse: RelanceItem[] = [];
  const noAppointment: RelanceItem[] = [];
  const unconfirmedRdv: RelanceItem[] = [];
  const estimationNotSigned: RelanceItem[] = [];

  for (const lead of allLeads) {
    const lastMsg = lead.messages[0];
    const lastActivity = lead.activities[0];
    const lastActionAt = lastMsg?.sentAt ?? lastActivity?.createdAt ?? lead.createdAt;
    const hasInbound = lead.messages.some((m) => m.direction === "INBOUND");

    if (lead.status === "NEW" && !hasInbound && lead.createdAt < new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
      noResponse.push({
        leadId: lead.id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        propertyAddress: lead.propertyAddress,
        type: "NO_RESPONSE",
        lastActionAt: lastActionAt.toISOString(),
        heatScore: lead.heatScore,
        suggestedAction: "Relancer par SMS + Email",
      });
    }
    if (
      (lead.status === "QUALIFIED" || lead.status === "IN_CONTACT" || lead.status === "IN_WHATSAPP_CONVERSATION") &&
      lead.updatedAt < xDaysAgo
    ) {
      noAppointment.push({
        leadId: lead.id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        propertyAddress: lead.propertyAddress,
        type: "NO_APPOINTMENT",
        lastActionAt: lastActionAt.toISOString(),
        heatScore: lead.heatScore,
        suggestedAction: "Proposer un RDV (SMS / Email / WhatsApp)",
      });
    }
    if (lead.status === "APPOINTMENT_SET" && !lead.rdvConfirmedAt) {
      unconfirmedRdv.push({
        leadId: lead.id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        propertyAddress: lead.propertyAddress,
        type: "UNCONFIRMED_RDV",
        lastActionAt: lastActionAt.toISOString(),
        heatScore: lead.heatScore,
        suggestedAction: "Demander confirmation du RDV",
      });
    }
    if (lead.status === "ESTIMATION_DONE" && lead.updatedAt < sevenDaysAgo) {
      estimationNotSigned.push({
        leadId: lead.id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        propertyAddress: lead.propertyAddress,
        type: "ESTIMATION_NOT_SIGNED",
        lastActionAt: lastActionAt.toISOString(),
        heatScore: lead.heatScore,
        suggestedAction: "Relance pour signature du mandat",
      });
    }
  }

  return NextResponse.json({
    noResponse,
    noAppointment,
    unconfirmedRdv,
    estimationNotSigned,
  });
}
