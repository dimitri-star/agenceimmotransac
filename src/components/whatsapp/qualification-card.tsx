"use client";

import type { Lead } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeatScoreBadge } from "@/components/leads/heat-score-badge";
import { ClipboardCheck, Timer, CheckCircle2, Circle, Wallet, Target, CalendarClock, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_DISPLAY = {
  NOT_STARTED: { label: "Non démarrée", color: "text-muted-foreground", icon: Circle },
  IN_PROGRESS: { label: "En cours", color: "text-amber-600", icon: Timer },
  COMPLETED: { label: "Terminée", color: "text-green-600", icon: CheckCircle2 },
};

export function QualificationCard({ lead }: { lead: Lead }) {
  const q = lead.qualification;
  const statusInfo = q ? STATUS_DISPLAY[q.status] : STATUS_DISPLAY.NOT_STARTED;
  const StatusIcon = statusInfo.icon;

  const fields = [
    { label: "Budget", value: q?.budget, icon: Wallet },
    { label: "Motivation", value: q?.motivation, icon: Target },
    { label: "Délai", value: q?.moveInTimeline, icon: CalendarClock },
    { label: "Type de recherche", value: q?.searchType, icon: Search },
  ];

  const completedFields = fields.filter((f) => f.value).length;
  const progress = q ? (completedFields / fields.length) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4" />
          Qualification
        </CardTitle>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1.5">
            <StatusIcon className={cn("h-4 w-4", statusInfo.color)} />
            <span className={cn("text-sm font-medium", statusInfo.color)}>
              {statusInfo.label}
            </span>
          </div>
          {q?.heatScore && <HeatScoreBadge score={q.heatScore} size="md" />}
          {lead.prospectPath && (
            <span className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-semibold",
              lead.prospectPath === "HOT"
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-700"
            )}>
              {lead.prospectPath === "HOT" ? "Prospect chaud" : "Hésitant"}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium">{completedFields}/{fields.length} champs</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                progress === 100 ? "bg-green-500" : progress >= 50 ? "bg-amber-500" : "bg-blue-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          {fields.map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.label} className="flex items-start gap-3">
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  field.value ? "bg-green-100" : "bg-muted"
                )}>
                  <Icon className={cn("h-4 w-4", field.value ? "text-green-600" : "text-muted-foreground")} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                  <p className={cn("text-sm font-medium", !field.value && "text-muted-foreground italic")}>
                    {field.value ?? "Non renseigné"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Calendly link if available */}
        {lead.calendlyLink && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
            <p className="text-xs font-medium text-indigo-700 mb-1">Lien Calendly envoyé</p>
            <a
              href={lead.calendlyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 underline break-all"
            >
              {lead.calendlyLink}
            </a>
          </div>
        )}

        {/* Completed date */}
        {q?.completedAt && (
          <p className="text-xs text-muted-foreground">
            Qualification terminée le{" "}
            {new Date(q.completedAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
