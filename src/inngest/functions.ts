import { inngest } from "./client";
import { prisma } from "@/lib/db";
import { sendSms } from "@/lib/sms";
import { sendEmail } from "@/lib/email";
import { sendWhatsApp } from "@/lib/whatsapp";
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

    const whatsAppBody = applyTemplate(
      "Bonjour {prénom}, nous avons bien reçu votre demande concernant {adresse_bien}. Pour vous proposer une visite adaptée, puis-je vous poser 2-3 questions rapides ?",
      vars
    );
    const waResult = await sendWhatsApp(lead.id, lead.phone, whatsAppBody);
    if (waResult.messageId && prisma) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: "IN_WHATSAPP_CONVERSATION" },
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

    return { ok: true, sms: !!smsResult.sid, email: !!emailResult.id, whatsApp: !!waResult.messageId };
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
      } else if (nextStep.channel === "WHATSAPP") {
        const body = applyTemplate(nextStep.templateContent, vars);
        await sendWhatsApp(lead.id, lead.phone, body);
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

function addHours(d: Date, h: number): Date {
  const r = new Date(d);
  r.setTime(r.getTime() + h * 60 * 60 * 1000);
  return r;
}

export const sendAppointmentReminders = inngest.createFunction(
  { id: "send-appointment-reminders", retries: 1 },
  { cron: "0 * * * *" },
  async () => {
    if (!prisma) return { j1: 0, h2: 0 };
    const now = new Date();
    const in24hMin = addHours(now, 23);
    const in24hMax = addHours(now, 25);
    const in2hMin = addHours(now, 1.5);
    const in2hMax = addHours(now, 2.5);
    let j1 = 0;
    let h2 = 0;
    const j1Leads = await prisma.lead.findMany({
      where: {
        status: "APPOINTMENT_SET",
        nextActionAt: { gte: in24hMin, lte: in24hMax },
      },
      include: { agency: true, assignedTo: { select: { name: true } } },
    });
    for (const lead of j1Leads) {
      const vars = templateVars(lead);
      const body = applyTemplate(
        "Bonjour {prénom}, rappel : votre visite est prévue demain. À très vite, {nom_négociateur}.",
        vars
      );
      await sendSms(lead.phone, body);
      await sendEmail(
        lead.email,
        "Rappel : visite prévue demain",
        `<p>Bonjour ${lead.firstName},</p><p>Rappel : votre visite est prévue demain.</p><p>À très vite, ${lead.assignedTo?.name ?? "votre conseiller"}.</p>`,
        lead.agency?.emailFrom ?? undefined
      );
      await sendWhatsApp(lead.id, lead.phone, body);
      if (prisma) {
        await prisma.message.create({
          data: {
            leadId: lead.id,
            channel: "SMS" as SequenceChannel,
            direction: "OUTBOUND" as MessageDirection,
            content: body,
            status: "SENT",
          },
        }).catch(() => {});
      }
      j1++;
    }
    const h2Leads = await prisma.lead.findMany({
      where: {
        status: "APPOINTMENT_SET",
        nextActionAt: { gte: in2hMin, lte: in2hMax },
      },
      include: { agency: true, assignedTo: { select: { name: true } } },
    });
    for (const lead of h2Leads) {
      const vars = templateVars(lead);
      const body = applyTemplate(
        "Bonjour {prénom}, votre visite est dans 2 h. À tout à l'heure, {nom_négociateur}.",
        vars
      );
      await sendSms(lead.phone, body);
      await sendWhatsApp(lead.id, lead.phone, body);
      if (prisma) {
        await prisma.message.create({
          data: {
            leadId: lead.id,
            channel: "SMS" as SequenceChannel,
            direction: "OUTBOUND" as MessageDirection,
            content: body,
            status: "SENT",
          },
        }).catch(() => {});
      }
      h2++;
    }
    return { j1, h2 };
  }
);
