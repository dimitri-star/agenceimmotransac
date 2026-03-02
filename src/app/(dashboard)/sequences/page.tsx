"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mockSequences, applyPreviewVars } from "@/lib/mock-sequences";
import type { Sequence, SequenceStep, SequenceChannel } from "@/types";
import { ChevronRight } from "lucide-react";

const CHANNEL_LABELS: Record<SequenceChannel, string> = {
  SMS: "SMS",
  EMAIL: "Email",
  MANUAL_TASK: "Tâche manuelle",
};

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>(mockSequences);
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null);
  const [editingStep, setEditingStep] = useState<SequenceStep | null>(null);

  const toggleActive = (id: string) => {
    setSequences((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Séquences</h1>
      <p className="text-muted-foreground">
        Configurez les séquences de relance automatique. Les variables {"{prénom}"}, {"{adresse_bien}"}, {"{nom_agence}"}, {"{nom_négociateur}"} sont remplacées dans les messages.
      </p>

      <div className="space-y-4">
        {sequences.map((seq) => (
          <Card key={seq.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{seq.name}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  ({seq.steps.length} étapes)
                </span>
              </div>
              <Switch
                checked={seq.isActive}
                onCheckedChange={() => toggleActive(seq.id)}
              />
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => setSelectedSequence(seq)}
                className="gap-2"
              >
                Modifier les étapes <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <SequenceEditorDialog
        sequence={selectedSequence}
        onClose={() => setSelectedSequence(null)}
        applyPreviewVars={applyPreviewVars}
      />
    </div>
  );
}

function SequenceEditorDialog({
  sequence,
  onClose,
  applyPreviewVars,
}: {
  sequence: Sequence | null;
  onClose: () => void;
  applyPreviewVars: (t: string) => string;
}) {
  const [previewStep, setPreviewStep] = useState<SequenceStep | null>(null);

  if (!sequence) return null;

  return (
    <Dialog open={!!sequence} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{sequence.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Déclenchement : lead en statut « {sequence.triggerStatus} »
          </p>
          <ul className="space-y-3">
            {sequence.steps.map((step) => (
              <li
                key={step.id}
                className="rounded-lg border p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    Étape {step.order} • {CHANNEL_LABELS[step.channel]}
                    {step.delayDays > 0 && ` • J+${step.delayDays}`}
                    {step.delayHours > 0 && ` • H+${step.delayHours}`}
                  </span>
                </div>
                {step.subject && (
                  <p className="text-sm text-muted-foreground">
                    Sujet : {applyPreviewVars(step.subject)}
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap">
                  {applyPreviewVars(step.templateContent)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewStep(previewStep?.id === step.id ? null : step)}
                >
                  {previewStep?.id === step.id ? "Masquer aperçu" : "Aperçu avec variables"}
                </Button>
                {previewStep?.id === step.id && (
                  <div className="rounded bg-muted p-3 text-sm">
                    <strong>Aperçu :</strong>
                    <p className="mt-1">{applyPreviewVars(step.templateContent)}</p>
                    {step.subject && (
                      <p className="mt-1 text-muted-foreground">
                        Sujet : {applyPreviewVars(step.subject)}
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            En Phase 1, les modifications ne sont pas enregistrées. Le backend (Phase 2) permettra d’éditer et sauvegarder les étapes.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
