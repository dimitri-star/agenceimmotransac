"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mockSequences, applyPreviewVars } from "@/lib/mock-sequences";
import type { Sequence, SequenceStep, SequenceChannel } from "@/types";
import {
  ChevronRight,
  MessageSquare,
  Mail,
  ClipboardList,
  Clock,
  Zap,
  ArrowDown,
  Users,
  Play,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CHANNEL_CONFIG: Record<SequenceChannel, { label: string; icon: typeof MessageSquare; color: string; bg: string }> = {
  SMS: { label: "SMS", icon: MessageSquare, color: "text-violet-600", bg: "bg-violet-100" },
  EMAIL: { label: "Email", icon: Mail, color: "text-cyan-600", bg: "bg-cyan-100" },
  MANUAL_TASK: { label: "Tache manuelle", icon: ClipboardList, color: "text-orange-600", bg: "bg-orange-100" },
};

const TRIGGER_LABELS: Record<string, string> = {
  NEW: "Nouveau lead",
  IN_CONTACT: "En contact",
  APPOINTMENT_SET: "RDV programme",
  ESTIMATION_DONE: "Estimation faite",
  MANDATE_SIGNED: "Mandat signe",
  LOST: "Perdu",
};

const MOCK_SEQUENCE_STATS: Record<string, { activeLeads: number; completed: number; avgDays: number }> = {
  "seq-1": { activeLeads: 3, completed: 12, avgDays: 4.2 },
  "seq-2": { activeLeads: 2, completed: 8, avgDays: 18.5 },
  "seq-3": { activeLeads: 0, completed: 3, avgDays: 2.1 },
};

function formatDelay(days: number, hours: number): string {
  if (days === 0 && hours === 0) return "Immediat";
  const parts: string[] = [];
  if (days > 0) parts.push(`J+${days}`);
  if (hours > 0) parts.push(`H+${hours}`);
  return parts.join(" ");
}

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>(mockSequences);
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null);

  const toggleActive = (id: string) => {
    setSequences((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sequences</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configurez les sequences de relance automatique. Les variables{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">{"{prenom}"}</code>,{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">{"{adresse_bien}"}</code>,{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">{"{nom_agence}"}</code>,{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">{"{nom_negociateur}"}</code>{" "}
          sont remplacees automatiquement.
        </p>
      </div>

      <div className="space-y-4">
        {sequences.map((seq) => {
          const stats = MOCK_SEQUENCE_STATS[seq.id];
          const channelCounts = seq.steps.reduce<Record<string, number>>((acc, step) => {
            acc[step.channel] = (acc[step.channel] || 0) + 1;
            return acc;
          }, {});

          return (
            <Card key={seq.id} className={cn("transition-all", !seq.isActive && "opacity-60")}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold">{seq.name}</h3>
                          <Badge variant={seq.isActive ? "default" : "secondary"} className="text-xs">
                            {seq.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Declenchement : statut &laquo; {TRIGGER_LABELS[seq.triggerStatus] ?? seq.triggerStatus} &raquo;
                        </p>
                      </div>
                    </div>

                    {/* Steps summary */}
                    <div className="flex flex-wrap items-center gap-2">
                      {seq.steps.map((step, i) => {
                        const config = CHANNEL_CONFIG[step.channel];
                        const Icon = config.icon;
                        return (
                          <div key={step.id} className="flex items-center gap-1.5">
                            <div className={cn("flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium", config.bg, config.color)}>
                              <Icon className="h-3 w-3" />
                              {formatDelay(step.delayDays, step.delayHours)}
                            </div>
                            {i < seq.steps.length - 1 && (
                              <ArrowDown className="h-3 w-3 text-muted-foreground/50" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Stats */}
                    {stats && (
                      <div className="flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Play className="h-3 w-3" />
                          <span><strong className="text-foreground">{stats.activeLeads}</strong> leads actifs</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span><strong className="text-foreground">{stats.completed}</strong> completes</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Duree moy. <strong className="text-foreground">{stats.avgDays}j</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Channel summary */}
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(channelCounts).map(([channel, count]) => {
                        const config = CHANNEL_CONFIG[channel as SequenceChannel];
                        return (
                          <span key={channel} className="rounded border px-2 py-0.5 text-xs text-muted-foreground">
                            {count}x {config?.label ?? channel}
                          </span>
                        );
                      })}
                      <span className="rounded border px-2 py-0.5 text-xs text-muted-foreground">
                        {seq.steps.length} etapes
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <Switch
                      checked={seq.isActive}
                      onCheckedChange={() => toggleActive(seq.id)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSequence(seq)}
                      className="gap-1.5"
                    >
                      Voir les etapes <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <SequenceEditorDialog
        sequence={selectedSequence}
        onClose={() => setSelectedSequence(null)}
      />
    </div>
  );
}

function SequenceEditorDialog({
  sequence,
  onClose,
}: {
  sequence: Sequence | null;
  onClose: () => void;
}) {
  const [previewStepId, setPreviewStepId] = useState<string | null>(null);

  if (!sequence) return null;

  return (
    <Dialog open={!!sequence} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {sequence.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Declenchement : statut &laquo; {TRIGGER_LABELS[sequence.triggerStatus] ?? sequence.triggerStatus} &raquo;
          </p>
        </DialogHeader>

        <div className="relative mt-2">
          {/* Vertical line */}
          <div className="absolute left-[22px] top-6 bottom-6 w-px bg-border" />

          <div className="space-y-0">
            {sequence.steps.map((step, i) => {
              const config = CHANNEL_CONFIG[step.channel];
              const Icon = config.icon;
              const isPreview = previewStepId === step.id;
              return (
                <div key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Step icon */}
                  <div className={cn(
                    "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-background",
                    config.bg
                  )}>
                    <Icon className={cn("h-5 w-5", config.color)} />
                  </div>

                  {/* Step content */}
                  <div className="flex-1 rounded-lg border bg-card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            Etape {step.order}
                          </span>
                          <Badge variant="outline" className={cn("text-xs", config.color)}>
                            {config.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {formatDelay(step.delayDays, step.delayHours)}
                          </Badge>
                        </div>
                        {step.subject && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Sujet : <span className="font-medium">{step.subject}</span>
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={() => setPreviewStepId(isPreview ? null : step.id)}
                      >
                        {isPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        {isPreview ? "Masquer" : "Apercu"}
                      </Button>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                      {step.templateContent}
                    </p>

                    {isPreview && (
                      <div className="mt-3 rounded-lg border border-dashed bg-muted/50 p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Apercu avec variables :
                        </p>
                        {step.subject && (
                          <p className="text-xs text-muted-foreground">
                            Sujet : <span className="font-medium text-foreground">{applyPreviewVars(step.subject)}</span>
                          </p>
                        )}
                        <p className="text-sm mt-1">{applyPreviewVars(step.templateContent)}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
