import type { DashboardKpis, FunnelStage, UrgentAction } from "@/types";

export const mockDashboardKpis: DashboardKpis = {
  leadsThisMonth: 23,
  appointmentsScheduled: 8,
  mandatesSigned: 5,
  conversionRate: 34,
  qualifiedLeads: 12,
  estimatedRevenue: 2250000,
  automationGeneratedRevenue: 1350000,
};

export const mockKpiTrends = {
  leadsThisMonth: { value: 23, previousValue: 18, trend: +27.8 },
  appointmentsScheduled: { value: 8, previousValue: 6, trend: +33.3 },
  mandatesSigned: { value: 5, previousValue: 3, trend: +66.7 },
  conversionRate: { value: 34, previousValue: 28, trend: +21.4 },
  qualifiedLeads: { value: 12, previousValue: 7, trend: +71.4 },
  estimatedRevenue: { value: 2250000, previousValue: 1800000, trend: +25.0 },
  automationGeneratedRevenue: { value: 1350000, previousValue: 900000, trend: +50.0 },
};

export const mockFunnelStages: FunnelStage[] = [
  { label: "Leads", count: 23, percentage: 100 },
  { label: "WhatsApp", count: 18, percentage: 78 },
  { label: "Qualifiés", count: 12, percentage: 52 },
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

export const mockPerformanceBySource = [
  { source: "SeLoger", leads: 8, mandats: 2, conversion: 25, color: "#ef4444" },
  { source: "LeBonCoin", leads: 6, mandats: 2, conversion: 33, color: "#f97316" },
  { source: "Site web", leads: 5, mandats: 1, conversion: 20, color: "#3b82f6" },
  { source: "Bien'ici", leads: 2, mandats: 0, conversion: 0, color: "#8b5cf6" },
  { source: "Manuel", leads: 1, mandats: 0, conversion: 0, color: "#6b7280" },
  { source: "Autre", leads: 1, mandats: 0, conversion: 0, color: "#a3a3a3" },
];

export const mockPerformanceByNegotiator = [
  { name: "Marie Martin", leads: 14, rdv: 5, mandats: 3, conversion: 21, avatar: "MM" },
  { name: "Jean Négociateur", leads: 9, rdv: 3, mandats: 2, conversion: 22, avatar: "JN" },
];

export const mockRecentLeads = [
  { id: "1", name: "Jean Dupont", address: "12 rue de la Paix, 75002", source: "SeLoger", status: "NEW" as const, createdAt: "2026-03-02T09:00:00Z", assignedTo: "Marie Martin" },
  { id: "8", name: "Camille Rousseau", address: "25 rue Oberkampf, 75011", source: "SeLoger", status: "IN_WHATSAPP_CONVERSATION" as const, createdAt: "2026-03-02T11:30:00Z", assignedTo: "Marie Martin" },
  { id: "10", name: "Léa Fontaine", address: "42 av. Victor Hugo, 75016", source: "Site web", status: "QUALIFIED" as const, createdAt: "2026-03-01T07:00:00Z", assignedTo: "Marie Martin" },
  { id: "3", name: "Pierre Martin", address: "5 rue du Commerce, 75015", source: "LeBonCoin", status: "IN_CONTACT" as const, createdAt: "2026-02-28T11:00:00Z", assignedTo: "Jean Négociateur" },
  { id: "5", name: "Luc Petit", address: "20 bd Haussmann, 75009", source: "Bien'ici", status: "ESTIMATION_DONE" as const, createdAt: "2026-02-20T10:00:00Z", assignedTo: "Jean Négociateur" },
];

export const mockWeeklyActivity = [
  { day: "Lun", leads: 4, contacts: 3, rdv: 1 },
  { day: "Mar", leads: 6, contacts: 4, rdv: 2 },
  { day: "Mer", leads: 3, contacts: 2, rdv: 1 },
  { day: "Jeu", leads: 5, contacts: 3, rdv: 2 },
  { day: "Ven", leads: 3, contacts: 2, rdv: 1 },
  { day: "Sam", leads: 2, contacts: 1, rdv: 1 },
  { day: "Dim", leads: 0, contacts: 0, rdv: 0 },
];

export const mockResponseTimeStats = {
  averageMinutes: 4.2,
  under5Min: 78,
  under15Min: 92,
  over30Min: 3,
};
