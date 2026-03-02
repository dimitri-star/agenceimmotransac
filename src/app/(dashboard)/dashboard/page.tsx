import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  mockDashboardKpis,
  mockFunnelStages,
  mockUrgentActions,
} from "@/lib/mock-dashboard";
import { AlertCircle, Calendar, FileSignature, TrendingUp } from "lucide-react";

const kpiIcons = [
  { key: "leads", Icon: TrendingUp },
  { key: "rdv", Icon: Calendar },
  { key: "mandats", Icon: FileSignature },
  { key: "taux", Icon: AlertCircle },
];

const kpiLabels = {
  leads: "Leads ce mois",
  rdv: "RDV programmés",
  mandats: "Mandats signés",
  taux: "Taux conversion",
};

export default function DashboardPage() {
  const kpiValues = [
    mockDashboardKpis.leadsThisMonth,
    mockDashboardKpis.appointmentsScheduled,
    mockDashboardKpis.mandatesSigned,
    `${mockDashboardKpis.conversionRate}%`,
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Select defaultValue="month">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Négociateur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="marie">Marie Martin</SelectItem>
              <SelectItem value="jean">Jean Négociateur</SelectItem>
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
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiIcons.map(({ key, Icon }, i) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpiLabels[key as keyof typeof kpiLabels]}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiValues[i]}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions urgentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Actions urgentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {mockUrgentActions.map((action) => (
              <li key={action.id}>
                <Link href={action.href}>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Badge
                      variant={
                        action.type === "leads_to_follow_up"
                          ? "destructive"
                          : action.type === "unconfirmed_rdv"
                            ? "secondary"
                            : "outline"
                      }
                      className="shrink-0"
                    >
                      {action.count}
                    </Badge>
                    {action.label}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Funnel du mois</CardTitle>
          <p className="text-sm text-muted-foreground">
            Leads → Contact → RDV → Estimation → Mandats
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockFunnelStages.map((stage) => (
              <div key={stage.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{stage.label}</span>
                  <span className="text-muted-foreground">{stage.count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
