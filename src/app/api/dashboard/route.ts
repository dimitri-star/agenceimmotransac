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
    prisma.lead.count({ where: { agencyId, createdAt: { gte: start } } }),
    prisma.lead.count({ where: { agencyId, status: "APPOINTMENT_SET", updatedAt: { gte: start } } }),
    prisma.lead.count({ where: { agencyId, status: "MANDATE_SIGNED", updatedAt: { gte: start } } }),
    prisma.lead.groupBy({
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

  const [toFollowUp, unconfirmedRdv, oldEstimations] = await Promise.all([
    prisma.lead.count({
      where: {
        agencyId,
        status: { in: ["NEW", "IN_CONTACT"] },
        nextActionAt: { lte: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000), gte: todayStart },
      },
    }),
    prisma.lead.count({
      where: { agencyId, status: "APPOINTMENT_SET" },
    }),
    prisma.lead.count({
      where: {
        agencyId,
        status: "ESTIMATION_DONE",
        updatedAt: { lt: sevenDaysAgo },
      },
    }),
  ]);

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
  });
}
