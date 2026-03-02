import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { inngest } from "@/inngest/client";
import { z } from "zod";

const webhookSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  propertyAddress: z.string().min(1),
  propertyType: z.string().optional(),
  propertySize: z.string().optional(),
  source: z.enum(["WEBSITE", "PORTAL_SELOGER", "PORTAL_LEBONCOIN", "PORTAL_BIENICI", "MANUAL", "OTHER"]).default("OTHER"),
  agencyId: z.string().min(1),
});

export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = req.headers.get("x-webhook-secret") ?? url.searchParams.get("secret");
  const expectedSecret = process.env.WEBHOOK_LEAD_SECRET;
  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await req.json();
  const parsed = webhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { agencyId, ...data } = parsed.data;

  const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
  if (!agency) {
    return NextResponse.json({ error: "Agency not found" }, { status: 404 });
  }

  const existing = await prisma.lead.findFirst({
    where: {
      agencyId,
      phone: data.phone,
      email: data.email,
    },
  });
  if (existing) {
    return NextResponse.json({ message: "Lead already exists", leadId: existing.id }, { status: 200 });
  }

  const lead = await prisma.lead.create({
    data: {
      agencyId,
      ...data,
    },
    include: { assignedTo: { select: { id: true, name: true } } },
  });

  await inngest.send({ name: "lead/created", data: { leadId: lead.id } });

  return NextResponse.json({
    message: "Lead created",
    leadId: lead.id,
    status: lead.status,
  });
}
