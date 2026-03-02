import type { DashboardKpis, FunnelStage, UrgentAction } from "@/types";

export const mockDashboardKpis: DashboardKpis = {
  leadsThisMonth: 23,
  appointmentsScheduled: 8,
  mandatesSigned: 5,
  conversionRate: 34,
};

export const mockFunnelStages: FunnelStage[] = [
  { label: "Leads", count: 23, percentage: 100 },
  { label: "Contact", count: 15, percentage: 65 },
  { label: "RDV", count: 8, percentage: 35 },
  { label: "Estim.", count: 6, percentage: 26 },
  { label: "Mandats", count: 5, percentage: 22 },
];

export const mockUrgentActions: UrgentAction[] = [
  {
    id: "1",
    type: "leads_to_follow_up",
    count: 3,
    label: "Leads à relancer aujourd'hui",
    href: "/pipeline?filter=to_follow",
  },
  {
    id: "2",
    type: "unconfirmed_rdv",
    count: 2,
    label: "RDV sans confirmation",
    href: "/pipeline?filter=unconfirmed_rdv",
  },
  {
    id: "3",
    type: "estimations_not_converted",
    count: 4,
    label: "Estimations non transformées >7j",
    href: "/pipeline?filter=estimation_old",
  },
];
