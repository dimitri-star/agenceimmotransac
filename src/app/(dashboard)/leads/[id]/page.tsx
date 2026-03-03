"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useLeadsStore } from "@/lib/leads-store";
import { mockActivitiesByLead, mockSequenceByLead } from "@/lib/mock-activities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  FileEdit,
  StickyNote,
  Mail,
  MapPin,
  Home,
  Ruler,
  Globe,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Play,
  Euro,
} from "lucide-react";
import { useState } from "react";
import type { LeadStatus, ActivityType } from "@/types";
import { LEAD_STATUS_ORDER } from "@/lib/mock-leads";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Nouveau",
  IN_CONTACT: "En contact",
  APPOINTMENT_SET: "RDV programme",
  ESTIMATION_DONE: "Estimation faite",
  MANDATE_SIGNED: "Mandat signe",
  LOST: "Perdu",
};

const STATUS_CONFIG: Record<LeadStatus, { bg: string; badge: string }> = {
  NEW: { bg: "bg-blue-50", badge: "bg-blue-100 text-blue-800" },
  IN_CONTACT: { bg: "bg-yellow-50", badge: "bg-yellow-100 text-yellow-800" },
  APPOINTMENT_SET: { bg: "bg-violet-50", badge: "bg-violet-100 text-violet-800" },
  ESTIMATION_DONE: { bg: "bg-orange-50", badge: "bg-orange-100 text-orange-800" },
  MANDATE_SIGNED: { bg: "bg-emerald-50", badge: "bg-emerald-100 text-emerald-800" },
  LOST: { bg: "bg-red-50", badge: "bg-red-100 text-red-800" },
};

const SOURCE_LABELS: Record<string, string> = {
  WEBSITE: "Site web",
  PORTAL_SELOGER: "SeLoger",
  PORTAL_LEBONCOIN: "LeBonCoin",
  PORTAL_BIENICI: "Bien'ici",
  MANUAL: "Manuel",
  OTHER: "Autre",
};

const ACTIVITY_ICONS: Record<ActivityType, { icon: typeof Phone; color: string; bg: string }> = {
  STATUS_CHANGE: { icon: FileEdit, color: "text-blue-600", bg: "bg-blue-100" },
  NOTE: { icon: StickyNote, color: "text-amber-600", bg: "bg-amber-100" },
  CALL: { icon: Phone, color: "text-green-600", bg: "bg-green-100" },
  SMS_SENT: { icon: MessageSquare, color: "text-violet-600", bg: "bg-violet-100" },
  EMAIL_SENT: { icon: Mail, color: "text-cyan-600", bg: "bg-cyan-100" },
  APPOINTMENT: { icon: Calendar, color: "text-purple-600", bg: "bg-purple-100" },
  MANUAL_TASK: { icon: CheckCircle2, color: "text-orange-600", bg: "bg-orange-100" },
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  STATUS_CHANGE: "Changement de statut",
  NOTE: "Note",
  CALL: "Appel",
  SMS_SENT: "SMS envoye",
  EMAIL_SENT: "Email envoye",
  APPOINTMENT: "RDV",
  MANUAL_TASK: "Tache",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LeadDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const getLeadById = useLeadsStore((s) => s.getLeadById);
  const setLeadStatus = useLeadsStore((s) => s.setLeadStatus);
  const lead = getLeadById(id);
  const [noteOpen, setNoteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newStatus, setNewStatus] = useState<LeadStatus | "">("");
  const [lostReason, setLostReason] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [mandateType, setMandateType] = useState<"EXCLUSIVE" | "SIMPLE" | "">("");

  if (!lead) {
    return (
      <div className="space-y-4">
        <Link href="/pipeline" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour au pipeline
        </Link>
        <div className="flex flex-col items-center justify-center py-12">
          <XCircle className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-muted-foreground">Lead introuvable.</p>
        </div>
      </div>
    );
  }

  const activities = mockActivitiesByLead[id] ?? [];
  const sequence = mockSequenceByLead[id];
  const statusConf = STATUS_CONFIG[lead.status];

  const handleStatusChange = () => {
    if (!newStatus || !(newStatus in STATUS_LABELS)) return;
    if (newStatus === "LOST" && !lostReason) return;
    if (newStatus === "ESTIMATION_DONE" && !estimatedValue) return;
    if (newStatus === "MANDATE_SIGNED" && !mandateType) return;

    setLeadStatus(lead.id, newStatus as LeadStatus, {
      ...(newStatus === "LOST" ? { lostReason } : {}),
      ...(newStatus === "ESTIMATION_DONE" ? { estimatedValue: parseFloat(estimatedValue) } : {}),
      ...(newStatus === "MANDATE_SIGNED" ? { mandateType: mandateType as "EXCLUSIVE" | "SIMPLE" } : {}),
    });
    setStatusOpen(false);
    setNewStatus("");
    setLostReason("");
    setEstimatedValue("");
    setMandateType("");
  };

  const statusIndex = LEAD_STATUS_ORDER.indexOf(lead.status);
  const progressSteps = LEAD_STATUS_ORDER.filter((s) => s !== "LOST");

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/pipeline" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour au pipeline
      </Link>

      {/* Header card */}
      <div className={cn("rounded-xl border p-5", statusConf.bg)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                {lead.firstName} {lead.lastName}
              </h1>
              <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", statusConf.badge)}>
                {STATUS_LABELS[lead.status]}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {lead.propertyAddress}
            </p>
            {lead.estimatedValue && (
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <Euro className="h-3.5 w-3.5" />
                {lead.estimatedValue.toLocaleString("fr-FR")} EUR
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="gap-1.5" asChild>
              <a href={`tel:${lead.phone}`}>
                <Phone className="h-3.5 w-3.5" /> Appeler
              </a>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href={`sms:${lead.phone}`}>
                <MessageSquare className="h-3.5 w-3.5" /> SMS
              </a>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href={`mailto:${lead.email}`}>
                <Mail className="h-3.5 w-3.5" /> Email
              </a>
            </Button>
          </div>
        </div>

        {/* Pipeline progress bar */}
        {lead.status !== "LOST" && (
          <div className="mt-5">
            <div className="flex items-center gap-1">
              {progressSteps.map((step, i) => {
                const stepIdx = LEAD_STATUS_ORDER.indexOf(step);
                const isActive = stepIdx <= statusIndex;
                const isCurrent = step === lead.status;
                return (
                  <div key={step} className="flex flex-1 items-center">
                    <div className="flex flex-1 flex-col items-center gap-1">
                      <div className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all",
                        isCurrent ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-1" :
                        isActive ? "bg-primary/80 text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {i + 1}
                      </div>
                      <span className={cn("text-[10px] font-medium text-center leading-tight", isActive ? "text-foreground" : "text-muted-foreground")}>
                        {STATUS_LABELS[step]}
                      </span>
                    </div>
                    {i < progressSteps.length - 1 && (
                      <div className={cn("h-0.5 flex-1 -mt-4", isActive && stepIdx < statusIndex ? "bg-primary/60" : "bg-muted")} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Info + Actions + Sequence */}
        <div className="space-y-4 lg:col-span-1">
          {/* Info card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow icon={Phone} label="Telephone" value={lead.phone} />
              <InfoRow icon={Mail} label="Email" value={lead.email} />
              <InfoRow icon={MapPin} label="Adresse" value={lead.propertyAddress} />
              {lead.propertyType && <InfoRow icon={Home} label="Type" value={lead.propertyType} />}
              {lead.propertySize && <InfoRow icon={Ruler} label="Surface" value={lead.propertySize} />}
              <InfoRow icon={Globe} label="Source" value={SOURCE_LABELS[lead.source] ?? lead.source} />
              {lead.assignedTo && <InfoRow icon={User} label="Negociateur" value={lead.assignedTo.name} />}
              <InfoRow icon={Clock} label="Cree le" value={formatDate(lead.createdAt)} />
              {lead.lostReason && <InfoRow icon={XCircle} label="Motif perte" value={lead.lostReason} />}
              {lead.mandateType && (
                <InfoRow
                  icon={CheckCircle2}
                  label="Mandat"
                  value={lead.mandateType === "EXCLUSIVE" ? "Exclusif" : "Simple"}
                />
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <FileEdit className="h-4 w-4" /> Changer le statut
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Changer le statut</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nouveau statut</Label>
                      <Select value={newStatus} onValueChange={(v) => setNewStatus(v as LeadStatus)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_STATUS_ORDER.map((s) => (
                            <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {newStatus === "ESTIMATION_DONE" && (
                      <div className="space-y-3 rounded-lg border bg-orange-50/50 p-3">
                        <p className="text-sm font-medium text-orange-800">Details de l&apos;estimation</p>
                        <div>
                          <Label>Prix estime (EUR) *</Label>
                          <Input
                            type="number"
                            placeholder="Ex. 350000"
                            value={estimatedValue}
                            onChange={(e) => setEstimatedValue(e.target.value)}
                          />
                          {estimatedValue && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {parseFloat(estimatedValue).toLocaleString("fr-FR")} EUR
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {newStatus === "MANDATE_SIGNED" && (
                      <div className="space-y-3 rounded-lg border bg-emerald-50/50 p-3">
                        <p className="text-sm font-medium text-emerald-800">Details du mandat</p>
                        <div>
                          <Label>Type de mandat *</Label>
                          <Select value={mandateType} onValueChange={(v) => setMandateType(v as "EXCLUSIVE" | "SIMPLE")}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selectionner le type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EXCLUSIVE">Exclusif</SelectItem>
                              <SelectItem value="SIMPLE">Simple</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                    {newStatus === "LOST" && (
                      <div className="space-y-3 rounded-lg border bg-red-50/50 p-3">
                        <p className="text-sm font-medium text-red-800">Motif de perte</p>
                        <div>
                          <Label>Raison *</Label>
                          <Input
                            placeholder="Ex. Injoignable, Concurrent..."
                            value={lostReason}
                            onChange={(e) => setLostReason(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                    <Button
                      onClick={handleStatusChange}
                      disabled={
                        !newStatus ||
                        (newStatus === "LOST" && !lostReason) ||
                        (newStatus === "ESTIMATION_DONE" && !estimatedValue) ||
                        (newStatus === "MANDATE_SIGNED" && !mandateType)
                      }
                      className="w-full"
                    >
                      Enregistrer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <StickyNote className="h-4 w-4" /> Ajouter une note
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter une note</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Note</Label>
                      <Textarea
                        placeholder="Saisir une note..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <Button onClick={() => { setNoteOpen(false); setNewNote(""); }} className="w-full">
                      Enregistrer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Sequence card */}
          {sequence && sequence.name !== "\u2014" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Sequence active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100">
                    <Play className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{sequence.name}</p>
                    <p className="text-xs text-muted-foreground">Etape {sequence.step + 1}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Prochaine :</span>
                      <span className="font-medium">{sequence.nextAction}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Historique complet des interactions
              </p>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm">Aucune activite enregistree.</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[18px] top-0 bottom-0 w-px bg-border" />
                  <ul className="space-y-4">
                    {[...activities].reverse().map((activity) => {
                      const config = ACTIVITY_ICONS[activity.type as ActivityType] ?? ACTIVITY_ICONS.NOTE;
                      const Icon = config.icon;
                      return (
                        <li key={activity.id} className="relative flex gap-3">
                          <div className={cn(
                            "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                            config.bg
                          )}>
                            <Icon className={cn("h-4 w-4", config.color)} />
                          </div>
                          <div className="flex-1 pt-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {ACTIVITY_TYPE_LABELS[activity.type] ?? activity.type}
                              </span>
                              {activity.userName && (
                                <span className="text-xs text-muted-foreground">
                                  par {activity.userName}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground/70">
                              {formatDate(activity.createdAt)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}
