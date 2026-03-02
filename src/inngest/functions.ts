import { inngest } from "./client";
import { prisma } from "@/lib/db";
import { sendSms } from "@/lib/sms";
import { sendEmail } from "@/lib/email";
import { SequenceChannel, MessageDirection } from "@/generated/prisma";

const templateVars = (lead: {
  firstName: string;
  lastName: string;
  propertyAddress: string;
  agency?: { name: string } | null;
  assignedTo?: { name: string } | null;
}) => ({
  prénom: lead.firstName,
  adresse_bien: lead.propertyAddress,
  nom_agence: lead.agency?.name ?? "Agence",
  nom_négociateur: lead.assignedTo?.name ?? "Votre conseiller",
});

function applyTemplate(text: string, vars: Record<string, string>): string {
  let out = text;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replace(new RegExp(`\\{${k}\\}`, "g"), v);
  }
  return out;
}

export const sendInstantReply = inngest.createFunction(
  { id: "send-instant-reply", retries: 2 },
  { event: "lead/created" },
  async ({ event }) => {
    const { leadId } = event.data;
    if (!prisma) return { ok: false, reason: "no-db" };

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { agency: true, assignedTo: { select: { name: true } } },
    });
    if (!lead) return { ok: false, reason: "lead-not-found" };

    const vars = templateVars(lead);
    const smsBody = applyTemplate(
      "Bonjour {prénom}, merci pour votre demande d'estimation pour {adresse_bien}. {nom_négociateur} vous contacte très vite.",
      vars
    );
    const smsResult = await sendSms(lead.phone, smsBody);
    if (smsResult.sid && prisma) {
      await prisma.message.create({
        data: {
          leadId: lead.id,
          channel: "SMS" as SequenceChannel,
          direction: "OUTBOUND" as MessageDirection,
          content: smsBody,
          status: "SENT",
        },
      });
    }

    const emailHtml = `<p>Bonjour ${lead.firstName},</p><p>Merci pour votre demande d'estimation pour le bien situé au ${lead.propertyAddress}.</p><p>${lead.assignedTo?.name ?? "Votre conseiller"} vous contactera très prochainement.</p>`;
    const emailResult = await sendEmail(
      lead.email,
      "Confirmation de votre demande d'estimation",
      emailHtml,
      lead.agency?.emailFrom ?? undefined
    );
    if (emailResult.id && prisma) {
      await prisma.message.create({
        data: {
          leadId: lead.id,
          channel: "EMAIL" as SequenceChannel,
          direction: "OUTBOUND" as MessageDirection,
          content: emailHtml,
          status: "SENT",
        },
      });
    }

    const newLeadSequence = await prisma.sequence.findFirst({
      where: { agencyId: lead.agencyId, triggerStatus: "NEW", isActive: true },
      include: { steps: { orderBy: { order: "asc" } } },
    });
    if (newLeadSequence?.steps.length && prisma) {
      const steps = newLeadSequence.steps;
      const nextStepIndex = 1;
      const nextStep = steps[nextStepIndex];
      const nextAt = nextStep
        ? (() => {
            const d = new Date();
            d.setDate(d.getDate() + (nextStep.delayDays ?? 0));
            d.setHours(d.getHours() + (nextStep.delayHours ?? 0));
            return d;
          })()
        : null;
      await prisma.sequenceExecution.create({
        data: {
          leadId: lead.id,
          sequenceId: newLeadSequence.id,
          currentStep: nextStepIndex,
          status: nextStep ? "ACTIVE" : "COMPLETED",
          nextExecutionAt: nextAt,
        },
      });
    }

    return { ok: true, sms: !!smsResult.sid, email: !!emailResult.id };
  }
);

export const runSequenceSteps = inngest.createFunction(
  { id: "run-sequence-steps", retries: 1 },
  { cron: "*/10 * * * *" },
  async () => {
    if (!prisma) return { processed: 0 };
    const now = new Date();
    const executions = await prisma.sequenceExecution.findMany({
      where: { status: "ACTIVE", nextExecutionAt: { lte: now } },
      include: {
        lead: { include: { agency: true, assignedTo: { select: { name: true } } } },
        sequence: { include: { steps: { orderBy: { order: "asc" } } } },
      },
      take: 50,
    });
    let processed = 0;
    for (const ex of executions) {
      const steps = ex.sequence.steps;
      const nextStep = steps[ex.currentStep];
      if (!nextStep) {
        await prisma.sequenceExecution.update({
          where: { id: ex.id },
          data: { status: "COMPLETED" },
        });
        processed++;
        continue;
      }
      const lead = ex.lead;
      const vars = templateVars({
        firstName: lead.firstName,
        lastName: lead.lastName,
        propertyAddress: lead.propertyAddress,
        agency: lead.agency,
        assignedTo: lead.assignedTo,
      });
      if (nextStep.channel === "SMS") {
        const body = applyTemplate(nextStep.templateContent, vars);
        await sendSms(lead.phone, body);
        await prisma.message.create({
          data: {
            leadId: lead.id,
            channel: "SMS" as SequenceChannel,
            direction: "OUTBOUND" as MessageDirection,
            content: body,
            status: "SENT",
          },
        });
      } else if (nextStep.channel === "EMAIL") {
        const html = applyTemplate(nextStep.templateContent, vars);
        await sendEmail(lead.email, nextStep.subject ?? "Message", html);
      }
      const isLast = ex.currentStep + 1 >= steps.length;
      const nextDelay = isLast ? null : (() => {
        const s = steps[ex.currentStep + 1];
        const d = new Date(now);
        d.setDate(d.getDate() + (s?.delayDays ?? 0));
        d.setHours(d.getHours() + (s?.delayHours ?? 0));
        return d;
      })();
      await prisma.sequenceExecution.update({
        where: { id: ex.id },
        data: {
          currentStep: ex.currentStep + 1,
          status: isLast ? "COMPLETED" : "ACTIVE",
          nextExecutionAt: nextDelay,
        },
      });
      processed++;
    }
    return { processed };
  }
);
