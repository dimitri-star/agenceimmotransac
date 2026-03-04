import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
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

  const lead = await prisma.lead.findFirst({
    where: {
      id,
      agencyId,
      ...(role === "NEGOTIATOR" ? { assignedToId: userId } : {}),
    },
    include: {
      assignedTo: { select: { id: true, name: true } },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: { select: { name: true } } },
      },
      messages: { orderBy: { sentAt: "asc" }, take: 100 },
    },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    ...lead,
    nextActionAt: lead.nextActionAt?.toISOString() ?? null,
    calendlyLinkSentAt: lead.calendlyLinkSentAt?.toISOString() ?? null,
    rdvConfirmedAt: lead.rdvConfirmedAt?.toISOString() ?? null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    activities: lead.activities.map((a) => ({
      id: a.id,
      leadId: a.leadId,
      type: a.type,
      description: a.description,
      createdAt: a.createdAt.toISOString(),
      userName: a.user?.name,
    })),
    messages: lead.messages.map((m) => ({
      id: m.id,
      leadId: m.leadId,
      channel: m.channel,
      direction: m.direction,
      content: m.content,
      status: m.status,
      sentAt: m.sentAt.toISOString(),
    })),
  });
}

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
  const { notes, assignedToId, estimatedValue, mandateType, ...rest } = body;
  const data: Record<string, unknown> = { ...rest };
  if (notes !== undefined) data.notes = notes;
  if (assignedToId !== undefined) data.assignedToId = assignedToId || null;
  if (estimatedValue !== undefined) data.estimatedValue = estimatedValue;
  if (mandateType !== undefined) data.mandateType = mandateType;

  const lead = await prisma.lead.update({
    where: { id },
    data,
    include: { assignedTo: { select: { id: true, name: true } } },
  });

  return NextResponse.json({
    ...lead,
    nextActionAt: lead.nextActionAt?.toISOString() ?? null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  });
}
