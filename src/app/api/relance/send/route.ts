import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendSms } from "@/lib/sms";
import { sendEmail } from "@/lib/email";
import { sendWhatsApp } from "@/lib/whatsapp";
import { SequenceChannel, MessageDirection } from "@/generated/prisma";

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user?.agencyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Base de données non configurée" }, { status: 503 });
  }
  const body = await req.json().catch(() => ({}));
  const { leadId } = body as { leadId?: string };
  if (!leadId) {
    return NextResponse.json({ error: "leadId requis" }, { status: 400 });
  }

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, agencyId: user.agencyId },
    include: { agency: true },
  });
  if (!lead) {
    return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });
  }

  const msg = `Bonjour ${lead.firstName}, nous n'avons pas eu de vos nouvelles concernant votre projet pour ${lead.propertyAddress}. Souhaitez-vous que nous vous recontactions ?`;
  const emailHtml = `<p>Bonjour ${lead.firstName},</p><p>Nous n'avons pas eu de vos nouvelles concernant votre projet pour le bien situé au ${lead.propertyAddress}.</p><p>Souhaitez-vous que nous vous recontactions ?</p>`;

  await sendSms(lead.phone, msg);
  await prisma.message.create({
    data: {
      leadId: lead.id,
      channel: "SMS" as SequenceChannel,
      direction: "OUTBOUND" as MessageDirection,
      content: msg,
      status: "SENT",
    },
  }).catch(() => {});
  await sendEmail(lead.email, "Relance – Votre projet immobilier", emailHtml, lead.agency?.emailFrom ?? undefined);
  await prisma.message.create({
    data: {
      leadId: lead.id,
      channel: "EMAIL" as SequenceChannel,
      direction: "OUTBOUND" as MessageDirection,
      content: emailHtml,
      status: "SENT",
    },
  }).catch(() => {});
  await sendWhatsApp(lead.id, lead.phone, msg);

  return NextResponse.json({ ok: true, leadId });
}
