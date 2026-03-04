import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getNextStep,
  computeHeatScore,
  computeProspectPath,
  type QualificationPayload,
} from "@/lib/qualification";
import { sendWhatsApp } from "@/lib/whatsapp";
import { sendCalendlyToLead } from "@/lib/calendly";

export async function POST(
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
  const { agencyId, role, id: userId } = sessionUser;

  const lead = await prisma.lead.findFirst({
    where: {
      id,
      agencyId,
      ...(role === "NEGOTIATOR" ? { assignedToId: userId } : {}),
    },
  });
  if (!lead) {
    return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const { questionKey, answer, simulate } = (body || {}) as {
    questionKey?: string;
    answer?: string;
    simulate?: boolean;
  };

  const currentPayload = (lead.qualificationPayload as QualificationPayload) ?? {};
  let key: string | null = questionKey ?? null;
  let simulatedAnswer: string | undefined = answer;

  if (simulate) {
    const stepToAnswer = getNextStep(currentPayload);
    if (!stepToAnswer) {
      return NextResponse.json({ error: "Qualification déjà terminée" }, { status: 400 });
    }
    key = stepToAnswer.key;
    const defaultAnswers: Record<string, string> = {
      interest: "oui",
      visit_date: "Dès que possible",
      budget: "300 000 €",
      move_in: "Sous 2 mois",
      search_type: "Exclusive",
    };
    simulatedAnswer = defaultAnswers[key] ?? "Oui";
  }

  if (!key && !simulate) {
    return NextResponse.json({ error: "questionKey/answer ou simulate requis" }, { status: 400 });
  }

  const newPayload: QualificationPayload = { ...currentPayload };
  if (key && simulatedAnswer !== undefined) {
    if (key === "move_in") newPayload.moveInTimeline = simulatedAnswer;
    else if (key === "search_type") newPayload.searchType = simulatedAnswer;
    else newPayload[key] = simulatedAnswer;
  }

  const nextStep = getNextStep(newPayload);
  const isCompleted = !nextStep;
  const heatScore = computeHeatScore(newPayload);
  const prospectPath = computeProspectPath(newPayload);

  const updated = await prisma.lead.update({
    where: { id },
    data: {
      qualificationPayload: newPayload as object,
      qualificationStatus: isCompleted ? "COMPLETED" : "IN_PROGRESS",
      ...(isCompleted
        ? {
            status: "QUALIFIED",
            heatScore,
            prospectPath,
          }
        : {}),
    },
    include: { assignedTo: { select: { id: true, name: true } } },
  });

  if (simulate && nextStep && lead.phone) {
    await sendWhatsApp(lead.id, lead.phone, nextStep.templateBody);
  }

  if (isCompleted && prospectPath === "HOT" && !lead.calendlyLinkSentAt) {
    await sendCalendlyToLead(lead.id);
  }

  const final = await prisma.lead.findUnique({
    where: { id },
    include: { assignedTo: { select: { id: true, name: true } } },
  });
  const out = final ?? updated;
  return NextResponse.json({
    ...out,
    nextActionAt: out.nextActionAt?.toISOString() ?? null,
    calendlyLinkSentAt: out.calendlyLinkSentAt?.toISOString() ?? null,
    createdAt: out.createdAt.toISOString(),
    updatedAt: out.updatedAt.toISOString(),
  });
}
