"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLeadsStore } from "@/lib/leads-store";
import { mockActivitiesByLead, mockSequenceByLead } from "@/lib/mock-activities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { ArrowLeft, Phone, MessageSquare, FileEdit, StickyNote } from "lucide-react";
import { useState } from "react";
import type { LeadStatus } from "@/types";
import { LEAD_STATUS_ORDER } from "@/lib/mock-leads";

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Nouveau",
  IN_CONTACT: "En contact",
  APPOINTMENT_SET: "RDV programmé",
  ESTIMATION_DONE: "Estimation faite",
  MANDATE_SIGNED: "Mandat signé",
  LOST: "Perdu",
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  STATUS_CHANGE: "Changement de statut",
  NOTE: "Note",
  CALL: "Appel",
  SMS_SENT: "SMS envoyé",
  EMAIL_SENT: "Email envoyé",
  APPOINTMENT: "RDV",
  MANUAL_TASK: "Tâche",
};

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const getLeadById = useLeadsStore((s) => s.getLeadById);
  const setLeadStatus = useLeadsStore((s) => s.setLeadStatus);
  const lead = getLeadById(id);
  const [noteOpen, setNoteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newStatus, setNewStatus] = useState<LeadStatus | "">("");
  const [lostReason, setLostReason] = useState("");

  if (!lead) {
    return (
      <div className="space-y-4">
        <Link href="/pipeline" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour au pipeline
        </Link>
        <p className="text-muted-foreground">Lead introuvable.</p>
      </div>
    );
  }

  const activities = mockActivitiesByLead[id] ?? [];
  const sequence = mockSequenceByLead[id];

  const handleStatusChange = () => {
    if (newStatus && newStatus in STATUS_LABELS) {
      setLeadStatus(lead.id, newStatus as LeadStatus, newStatus === "LOST" ? lostReason : undefined);
      setStatusOpen(false);
      setNewStatus("");
      setLostReason("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/pipeline" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour au pipeline
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Infos + Actions */}
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {lead.firstName} {lead.lastName}
              </CardTitle>
              <Badge>{STATUS_LABELS[lead.status]}</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Tél.</span> {lead.phone}
              </div>
              <div>
                <span className="text-muted-foreground">Email</span> {lead.email}
              </div>
              <div>
                <span className="text-muted-foreground">Bien</span> {lead.propertyAddress}
              </div>
              {lead.propertyType && (
                <div>
                  <span className="text-muted-foreground">Type</span> {lead.propertyType}
                  {lead.propertySize && ` • ${lead.propertySize}`}
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Source</span> {lead.source}
              </div>
              {lead.assignedTo && (
                <div>
                  <span className="text-muted-foreground">Négociateur</span> {lead.assignedTo.name}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href={`tel:${lead.phone}`}>
                <Phone className="h-4 w-4" /> Appeler
              </a>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href={`sms:${lead.phone}`}>
                <MessageSquare className="h-4 w-4" /> SMS
              </a>
            </Button>
            <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <FileEdit className="h-4 w-4" /> Changer statut
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
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAD_STATUS_ORDER.map((s) => (
                          <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {newStatus === "LOST" && (
                    <div>
                      <Label>Motif (obligatoire)</Label>
                      <Input
                        placeholder="Ex. Injoignable, Concurrent..."
                        value={lostReason}
                        onChange={(e) => setLostReason(e.target.value)}
                      />
                    </div>
                  )}
                  <Button onClick={handleStatusChange} disabled={!newStatus || (newStatus === "LOST" && !lostReason)}>
                    Enregistrer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <StickyNote className="h-4 w-4" /> Ajouter note
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
                  <Button onClick={() => { setNoteOpen(false); setNewNote(""); }}>
                    Enregistrer (démo)
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {sequence && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Séquence en cours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div><span className="text-muted-foreground">Séquence</span> {sequence.name}</div>
                <div><span className="text-muted-foreground">Prochaine action</span> {sequence.nextAction}</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {activities.length === 0 ? (
                  <li className="text-sm text-muted-foreground">Aucune activité.</li>
                ) : (
                  [...activities].reverse().map((activity) => (
                    <li key={activity.id} className="flex gap-3 border-l-2 border-muted pl-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {ACTIVITY_TYPE_LABELS[activity.type] ?? activity.type}
                        </p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(activity.createdAt).toLocaleString("fr-FR")}
                          {activity.userName && ` • ${activity.userName}`}
                        </p>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
