import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { inngest } from "@/inngest/client";
import { z } from "zod";

const createLeadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  propertyAddress: z.string().min(1),
  propertyType: z.string().optional(),
  propertySize: z.string().optional(),
  source: z.enum(["WEBSITE", "PORTAL_SELOGER", "PORTAL_LEBONCOIN", "PORTAL_BIENICI", "MANUAL", "OTHER"]).default("MANUAL"),
});

export async function GET() {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user?.agencyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Base de données non configurée" }, { status: 503 });
  }
  const { role, agencyId, id: userId } = user;

  const leads = await prisma.lead.findMany({
    where: role === "NEGOTIATOR" ? { agencyId, assignedToId: userId } : { agencyId },
    orderBy: { updatedAt: "desc" },
    include: { assignedTo: { select: { id: true, name: true } } },
  });

  const mapped = leads.map((l) => ({
    id: l.id,
    firstName: l.firstName,
    lastName: l.lastName,
    email: l.email,
    phone: l.phone,
    propertyAddress: l.propertyAddress,
    propertyType: l.propertyType,
    propertySize: l.propertySize,
    source: l.source,
    status: l.status,
    lostReason: l.lostReason,
    estimatedValue: l.estimatedValue,
    mandateType: l.mandateType,
    notes: l.notes,
    assignedTo: l.assignedTo ? { id: l.assignedTo.id, name: l.assignedTo.name } : undefined,
    nextActionAt: l.nextActionAt?.toISOString(),
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));

  return NextResponse.json(mapped);
}

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user?.agencyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Base de données non configurée" }, { status: 503 });
  }

  const body = await req.json();
  const parsed = createLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const agencyId = user.agencyId;
  const lead = await prisma.lead.create({
    data: {
      agencyId,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      propertyAddress: parsed.data.propertyAddress,
      propertyType: parsed.data.propertyType,
      propertySize: parsed.data.propertySize,
      source: parsed.data.source,
    },
    include: { assignedTo: { select: { id: true, name: true } } },
  });

  await inngest.send({ name: "lead/created", data: { leadId: lead.id } });

  return NextResponse.json({
    id: lead.id,
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    propertyAddress: lead.propertyAddress,
    propertyType: lead.propertyType,
    propertySize: lead.propertySize,
    source: lead.source,
    status: lead.status,
    assignedTo: lead.assignedTo ? { id: lead.assignedTo.id, name: lead.assignedTo.name } : undefined,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  });
}
