import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  const agencyId = (session?.user as { agencyId?: string } | undefined)?.agencyId;
  if (!agencyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Base de données non configurée" }, { status: 503 });
  }
  const db = prisma;
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "month";

  const now = new Date();
  let start: Date;
  if (period === "week") {
    start = new Date(now);
    start.setDate(start.getDate() - 7);
  } else if (period === "quarter") {
    start = new Date(now);
    start.setMonth(start.getMonth() - 3);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const [leads, rdv, mandats, allLeads] = await Promise.all([
    db.lead.count({ where: { agencyId, createdAt: { gte: start } } }),
    db.lead.count({ where: { agencyId, status: "APPOINTMENT_SET", updatedAt: { gte: start } } }),
    db.lead.count({ where: { agencyId, status: "MANDATE_SIGNED", updatedAt: { gte: start } } }),
    db.lead.groupBy({
      by: ["status"],
      where: { agencyId, createdAt: { gte: start } },
      _count: true,
    }),
  ]);

  const funnel = [
    { label: "Leads", count: leads },
    { label: "Contact", count: allLeads.find((g) => g.status === "IN_CONTACT")?._count ?? 0 },
    { label: "RDV", count: allLeads.find((g) => g.status === "APPOINTMENT_SET")?._count ?? 0 },
    { label: "Estim.", count: allLeads.find((g) => g.status === "ESTIMATION_DONE")?._count ?? 0 },
    { label: "Mandats", count: mandats },
  ];
  const conversionRate = leads > 0 ? Math.round((mandats / leads) * 100) : 0;

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [toFollowUp, unconfirmedRdv, oldEstimations, agencyRow, mandatesWithAutomation] = await Promise.all([
    db.lead.count({
      where: {
        agencyId,
        status: { in: ["NEW", "IN_CONTACT"] },
        nextActionAt: { lte: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000), gte: todayStart },
      },
    }),
    db.lead.count({
      where: { agencyId, status: "APPOINTMENT_SET" },
    }),
    db.lead.count({
      where: {
        agencyId,
        status: "ESTIMATION_DONE",
        updatedAt: { lt: sevenDaysAgo },
      },
    }),
    db.agency.findUnique({
      where: { id: agencyId },
      select: { defaultCommission: true },
    }),
    db.lead.findMany({
      where: { agencyId, status: "MANDATE_SIGNED" },
      select: { id: true, createdAt: true },
    }),
  ]);

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const countWithAutomation = await Promise.all(
    mandatesWithAutomation.map(async (l) => {
      const cutoff = new Date(l.createdAt.getTime() + sevenDaysMs);
      const msg = await db.message.findFirst({
        where: { leadId: l.id, sentAt: { gte: l.createdAt, lte: cutoff } },
        select: { id: true },
      });
      return msg ? 1 : 0;
    })
  ).then((arr) => arr.reduce((a: number, b) => a + b, 0 as number));
  const commission = agencyRow?.defaultCommission ?? 8000;
  const revenueFromAutomation = countWithAutomation * commission;

  return NextResponse.json({
    kpis: {
      leadsThisMonth: leads,
      appointmentsScheduled: rdv,
      mandatesSigned: mandats,
      conversionRate,
    },
    funnel: funnel.map((f) => ({ ...f, percentage: leads > 0 ? Math.round((f.count / leads) * 100) : 0 })),
    urgentActions: [
      { type: "leads_to_follow_up", count: toFollowUp, label: "Leads à relancer aujourd'hui", href: "/pipeline?filter=to_follow" },
      { type: "unconfirmed_rdv", count: unconfirmedRdv, label: "RDV sans confirmation", href: "/pipeline?filter=unconfirmed_rdv" },
      { type: "estimations_not_converted", count: oldEstimations, label: "Estimations non transformées >7j", href: "/pipeline?filter=estimation_old" },
    ],
    revenueFromAutomation: {
      countMandatesWithAutomation: countWithAutomation,
      commissionPerMandate: commission,
      totalRevenue: revenueFromAutomation,
    },
  });
}
