import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { LeadStatus } from "@/generated/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const sessionUser = session?.user as SessionUser | undefined;
  if (!sessionUser?.agencyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Base de données non configurée" }, { status: 503 });
  }
  const { id } = await params;
  const { agencyId, id: userId, role } = sessionUser;

  const existing = await prisma.lead.findFirst({
    where: { id, agencyId, ...(role === "NEGOTIATOR" ? { assignedToId: userId } : {}) },
  });
  if (!existing) {
    return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });
  }

  const body = await req.json();
  const status = body.status as LeadStatus | undefined;
  const lostReason = body.lostReason as string | undefined;

  const validStatuses: LeadStatus[] = [
    "NEW",
    "IN_WHATSAPP_CONVERSATION",
    "QUALIFIED",
    "IN_CONTACT",
    "APPOINTMENT_SET",
    "ESTIMATION_DONE",
    "MANDATE_SIGNED",
    "LOST",
  ];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }
  if (status === "LOST" && !lostReason?.trim()) {
    return NextResponse.json({ error: "Motif obligatoire pour un lead perdu" }, { status: 400 });
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      status,
      ...(status === "LOST" && lostReason ? { lostReason: lostReason.trim() } : {}),
    },
    include: { assignedTo: { select: { id: true, name: true } } },
  });

  await prisma.activity.create({
    data: {
      leadId: id,
      userId,
      type: "STATUS_CHANGE",
      description: `Statut passé à ${status}${status === "LOST" && lostReason ? ` - ${lostReason}` : ""}`,
    },
  });

  return NextResponse.json({
    ...lead,
    nextActionAt: lead.nextActionAt?.toISOString() ?? null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  });
}
