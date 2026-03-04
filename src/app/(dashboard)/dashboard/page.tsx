"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  mockKpiTrends,
  mockFunnelStages,
  mockUrgentActions,
  mockPerformanceBySource,
  mockPerformanceByNegotiator,
  mockRecentLeads,
  mockWeeklyActivity,
  mockResponseTimeStats,
} from "@/lib/mock-dashboard";
import {
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  FileSignature,
  Phone,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  UserCheck,
  Target,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  NEW: { label: "Nouveau", className: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300" },
  IN_WHATSAPP_CONVERSATION: { label: "En conv. WhatsApp", className: "bg-sky-200/70 text-sky-900 dark:bg-sky-900/30 dark:text-sky-300" },
  QUALIFIED: { label: "Qualifié", className: "bg-violet-200/70 text-violet-900 dark:bg-violet-900/30 dark:text-violet-300" },
  IN_CONTACT: { label: "En contact", className: "bg-amber-200/70 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300" },
  APPOINTMENT_SET: { label: "RDV pris", className: "bg-violet-200/70 text-violet-900 dark:bg-violet-900/30 dark:text-violet-300" },
  ESTIMATION_DONE: { label: "Estime", className: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300" },
  MANDATE_SIGNED: { label: "Mandat", className: "bg-emerald-200/70 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300" },
  LOST: { label: "Perdu", className: "bg-red-200/70 text-red-900 dark:bg-red-900/30 dark:text-red-300" },
};

const FUNNEL_COLORS = [
  "bg-slate-600 dark:bg-slate-500",
  "bg-slate-500 dark:bg-slate-400",
  "bg-primary",
  "bg-slate-500 dark:bg-slate-400",
  "bg-slate-600 dark:bg-slate-500",
];

function formatTimeAgo(dateStr: string): string {
  const now = new Date("2026-03-03T10:00:00Z");
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  if (diffHours < 1) return "Il y a moins d'1h";
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return "Hier";
  return `Il y a ${diffDays}j`;
}

type DashboardApi = {
  kpis?: { leadsThisMonth: number; appointmentsScheduled: number; mandatesSigned: number; conversionRate: number };
  revenueFromAutomation?: { countMandatesWithAutomation: number; commissionPerMandate: number; totalRevenue: number };
  urgentActions?: { type: string; count: number; label: string; href: string }[];
};

export default function DashboardPage() {
  const [period, setPeriod] = useState("month");
  const [apiData, setApiData] = useState<DashboardApi | null>(null);
  useEffect(() => {
    fetch(`/api/dashboard?period=${period}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setApiData(d))
      .catch(() => {});
  }, [period]);

  const kpis = apiData?.kpis ?? {
    leadsThisMonth: mockKpiTrends.leadsThisMonth.value,
    appointmentsScheduled: mockKpiTrends.appointmentsScheduled.value,
    mandatesSigned: mockKpiTrends.mandatesSigned.value,
    conversionRate: mockKpiTrends.conversionRate.value,
  };
  const urgentActions = apiData?.urgentActions ?? mockUrgentActions;
  const revenueFromAutomation = apiData?.revenueFromAutomation;

  const kpiCards = [
    { key: "leads", label: "Leads ce mois", value: kpis.leadsThisMonth, icon: TrendingUp, format: (v: number) => String(v), iconBg: "bg-sky-200/80 dark:bg-sky-900/50", iconColor: "text-sky-700 dark:text-sky-400" },
    { key: "rdv", label: "RDV programmés", value: kpis.appointmentsScheduled, icon: Calendar, format: (v: number) => String(v), iconBg: "bg-violet-200/80 dark:bg-violet-900/40", iconColor: "text-violet-700 dark:text-violet-400" },
    { key: "mandats", label: "Mandats signés", value: kpis.mandatesSigned, icon: FileSignature, format: (v: number) => String(v), iconBg: "bg-emerald-200/80 dark:bg-emerald-900/40", iconColor: "text-emerald-700 dark:text-emerald-400" },
    { key: "taux", label: "Taux conversion", value: kpis.conversionRate, icon: Target, format: (v: number) => `${v}%`, iconBg: "bg-amber-200/80 dark:bg-amber-900/40", iconColor: "text-amber-700 dark:text-amber-400" },
  ];

  const maxWeeklyLeads = Math.max(...mockWeeklyActivity.map((d) => d.leads));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Vue d&apos;ensemble de votre activite ce mois
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Negociateur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="marie">Marie Martin</SelectItem>
              <SelectItem value="jean">Jean Negociateur</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="website">Site web</SelectItem>
              <SelectItem value="seloger">SeLoger</SelectItem>
              <SelectItem value="leboncoin">LeBonCoin</SelectItem>
              <SelectItem value="bienici">Bien&apos;ici</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.key} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                <div className={`rounded-lg p-2 ${kpi.iconBg}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.iconColor}`} />
                </div>
              </div>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-3xl font-bold tracking-tight">{kpi.format(kpi.value)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenus générés par traitement automatisé */}
      {revenueFromAutomation != null && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-amber-500" />
              Revenus générés par traitement automatisé
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Mandats signés ayant reçu au moins un message auto dans les 7 jours suivant la création du lead
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-baseline gap-4">
              <div>
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {revenueFromAutomation.totalRevenue.toLocaleString("fr-FR")} €
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {revenueFromAutomation.countMandatesWithAutomation} mandat(s) × {revenueFromAutomation.commissionPerMandate.toLocaleString("fr-FR")} € de commission moyenne
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Row 2: Actions urgentes + Temps de reponse */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Actions urgentes */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              Actions urgentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {urgentActions.map((action, i) => {
                const actionConfig = {
                  leads_to_follow_up: { icon: Phone, color: "bg-slate-600 text-slate-100 dark:bg-slate-500 dark:text-slate-200" },
                  unconfirmed_rdv: { icon: Calendar, color: "bg-slate-600 text-slate-100 dark:bg-slate-500 dark:text-slate-200" },
                  estimations_not_converted: { icon: FileSignature, color: "bg-slate-600 text-slate-100 dark:bg-slate-500 dark:text-slate-200" },
                }[action.type];
                const Icon = actionConfig?.icon ?? AlertCircle;
                const pillColor = actionConfig?.color ?? "bg-primary text-primary-foreground";
                return (
                  <Link key={action.type ?? i} href={action.href}>
                    <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${pillColor}`}>
                        <span className="text-sm font-bold">{action.count}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{action.label}</p>
                      </div>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Temps de reponse */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              Temps de reponse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-2">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-sky-300 bg-sky-100/80 dark:border-sky-700 dark:bg-sky-900/40">
                <div className="text-center">
                  <span className="text-2xl font-bold text-sky-800 dark:text-sky-300">
                    {mockResponseTimeStats.averageMinutes}
                  </span>
                  <span className="block text-xs text-sky-700 dark:text-sky-400">min moy.</span>
                </div>
              </div>
              <div className="mt-4 grid w-full grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-emerald-100/80 p-2 dark:bg-emerald-900/30">
                  <div className="text-lg font-bold text-emerald-800 dark:text-emerald-400">{mockResponseTimeStats.under5Min}%</div>
                  <div className="text-xs text-muted-foreground">&lt;5 min</div>
                </div>
                <div className="rounded-lg bg-sky-100/80 p-2 dark:bg-sky-900/30">
                  <div className="text-lg font-bold text-sky-800 dark:text-sky-400">{mockResponseTimeStats.under15Min}%</div>
                  <div className="text-xs text-muted-foreground">&lt;15 min</div>
                </div>
                <div className="rounded-lg bg-amber-100/80 p-2 dark:bg-amber-900/30">
                  <div className="text-lg font-bold text-amber-800 dark:text-amber-400">{mockResponseTimeStats.over30Min}%</div>
                  <div className="text-xs text-muted-foreground">&gt;30 min</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Funnel + Activite semaine */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Funnel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              Funnel du mois
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Leads &rarr; Contact &rarr; RDV &rarr; Estimation &rarr; Mandats
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockFunnelStages.map((stage, i) => (
                <div key={stage.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stage.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{stage.count}</span>
                      <span className="text-xs text-muted-foreground">
                        ({stage.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${FUNNEL_COLORS[i]}`}
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                  {i < mockFunnelStages.length - 1 && (
                    <div className="flex justify-end">
                      <span className="text-xs text-muted-foreground">
                        {Math.round((mockFunnelStages[i + 1].count / stage.count) * 100)}% &darr;
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activite de la semaine */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              Activite de la semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2" style={{ height: "180px" }}>
              {mockWeeklyActivity.map((day) => (
                <div key={day.day} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-col items-center gap-0.5" style={{ height: "140px", justifyContent: "flex-end" }}>
                    <div
                      className="w-full max-w-[32px] rounded-t bg-slate-600 dark:bg-slate-500 transition-all"
                      style={{ height: `${maxWeeklyLeads > 0 ? (day.leads / maxWeeklyLeads) * 100 : 0}%`, minHeight: day.leads > 0 ? "4px" : "0px" }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{day.day}</span>
                  <span className="text-xs font-bold">{day.leads}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-slate-600 dark:bg-slate-500" />
                <span className="text-muted-foreground">Leads</span>
              </div>
              <div className="text-muted-foreground">
                Total : <span className="font-bold text-foreground">{mockWeeklyActivity.reduce((s, d) => s + d.leads, 0)}</span> leads
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Performance par source + Performance par negociateur */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Performance par source */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              Performance par source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockPerformanceBySource.map((source, i) => {
                const barColors = ["bg-sky-600 dark:bg-sky-500", "bg-amber-600 dark:bg-amber-500", "bg-violet-600 dark:bg-violet-500", "bg-emerald-600 dark:bg-emerald-500", "bg-slate-500 dark:bg-slate-500", "bg-slate-500 dark:bg-slate-500"];
                const dotColor = barColors[i] ?? "bg-slate-500";
                return (
                  <div key={source.source} className="flex items-center gap-3">
                    <div className={`h-3 w-3 shrink-0 rounded-full ${dotColor}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{source.source}</span>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground">{source.leads} leads</span>
                          <span className="font-bold">{source.mandats} mandats</span>
                        </div>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${dotColor} transition-all`}
                          style={{
                            width: `${(source.leads / Math.max(...mockPerformanceBySource.map((s) => s.leads))) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Performance par negociateur */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCheck className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              Performance par negociateur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPerformanceByNegotiator.map((neg) => (
                <div key={neg.name} className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                        {neg.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{neg.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Taux conversion : {neg.conversion}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-sky-100/80 p-2 text-center dark:bg-sky-900/30">
                      <div className="text-lg font-bold text-sky-800 dark:text-sky-400">{neg.leads}</div>
                      <div className="text-xs text-muted-foreground">Leads</div>
                    </div>
                    <div className="rounded-lg bg-violet-100/80 p-2 text-center dark:bg-violet-900/30">
                      <div className="text-lg font-bold text-violet-800 dark:text-violet-400">{neg.rdv}</div>
                      <div className="text-xs text-muted-foreground">RDV</div>
                    </div>
                    <div className="rounded-lg bg-emerald-100/80 p-2 text-center dark:bg-emerald-900/30">
                      <div className="text-lg font-bold text-emerald-800 dark:text-emerald-400">{neg.mandats}</div>
                      <div className="text-xs text-muted-foreground">Mandats</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Leads recents */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              Leads recents
            </CardTitle>
            <Link href="/pipeline">
              <Button variant="ghost" size="sm" className="text-xs">
                Voir tout &rarr;
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Nom</th>
                  <th className="hidden pb-2 pr-4 font-medium sm:table-cell">Adresse</th>
                  <th className="pb-2 pr-4 font-medium">Source</th>
                  <th className="pb-2 pr-4 font-medium">Statut</th>
                  <th className="hidden pb-2 pr-4 font-medium md:table-cell">Negociateur</th>
                  <th className="pb-2 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {mockRecentLeads.map((lead) => {
                  const statusConf = STATUS_CONFIG[lead.status] ?? { label: lead.status, className: "bg-gray-100 text-gray-800" };
                  return (
                    <tr key={lead.id} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        <Link href={`/leads/${lead.id}`} className="font-medium hover:underline">
                          {lead.name}
                        </Link>
                      </td>
                      <td className="hidden py-3 pr-4 text-muted-foreground sm:table-cell">
                        {lead.address}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="text-xs">{lead.source}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusConf.className}`}>
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="hidden py-3 pr-4 text-muted-foreground md:table-cell">
                        {lead.assignedTo}
                      </td>
                      <td className="py-3 text-right text-xs text-muted-foreground">
                        {formatTimeAgo(lead.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
