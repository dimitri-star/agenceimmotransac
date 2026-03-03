"use client";

import { useCallback, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useLeadsStore, LEAD_STATUS_ORDER } from "@/lib/leads-store";
import type { Lead, LeadStatus, LeadSource } from "@/types";
import { KanbanColumn } from "@/components/pipeline/kanban-column";
import { LeadCard } from "@/components/pipeline/lead-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, RotateCcw } from "lucide-react";

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Nouveau",
  IN_CONTACT: "En contact",
  APPOINTMENT_SET: "RDV programme",
  ESTIMATION_DONE: "Estimation faite",
  MANDATE_SIGNED: "Mandat signe",
  LOST: "Perdu",
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  NEW: "border-t-blue-500",
  IN_CONTACT: "border-t-yellow-500",
  APPOINTMENT_SET: "border-t-violet-500",
  ESTIMATION_DONE: "border-t-orange-500",
  MANDATE_SIGNED: "border-t-emerald-500",
  LOST: "border-t-red-400",
};

const SOURCE_OPTIONS: { value: LeadSource; label: string }[] = [
  { value: "WEBSITE", label: "Site web" },
  { value: "PORTAL_SELOGER", label: "SeLoger" },
  { value: "PORTAL_LEBONCOIN", label: "LeBonCoin" },
  { value: "PORTAL_BIENICI", label: "Bien'ici" },
  { value: "MANUAL", label: "Manuel" },
  { value: "OTHER", label: "Autre" },
];

const NEGOTIATORS = [
  { id: "u1", name: "Marie Martin" },
  { id: "u2", name: "Jean Negociateur" },
];

export default function PipelinePage() {
  const { leads, setLeadStatus, getLeadsByStatus, addLead, resetToMock } = useLeadsStore();
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    propertyAddress: "",
    propertyType: "",
    propertySize: "",
    source: "MANUAL" as LeadSource,
    assignedToId: "u1",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const lead = leads.find((l) => l.id === event.active.id);
    if (lead) setActiveLead(lead);
  }, [leads]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveLead(null);
      const { active, over } = event;
      if (!over) return;
      const newStatus = over.id as LeadStatus;
      if (LEAD_STATUS_ORDER.includes(newStatus)) {
        setLeadStatus(active.id as string, newStatus);
      }
    },
    [setLeadStatus]
  );

  const handleAddLead = () => {
    if (!newLead.firstName || !newLead.lastName || !newLead.phone) return;
    const negotiator = NEGOTIATORS.find((n) => n.id === newLead.assignedToId);
    addLead({
      firstName: newLead.firstName,
      lastName: newLead.lastName,
      phone: newLead.phone,
      email: newLead.email,
      propertyAddress: newLead.propertyAddress,
      propertyType: newLead.propertyType || undefined,
      propertySize: newLead.propertySize || undefined,
      source: newLead.source,
      assignedTo: negotiator ? { id: negotiator.id, name: negotiator.name } : undefined,
    });
    setNewLead({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      propertyAddress: "",
      propertyType: "",
      propertySize: "",
      source: "MANUAL",
      assignedToId: "u1",
    });
    setAddDialogOpen(false);
  };

  const filteredLeadsByStatus = (status: LeadStatus) => {
    const statusLeads = getLeadsByStatus(status);
    if (!searchQuery) return statusLeads;
    const q = searchQuery.toLowerCase();
    return statusLeads.filter(
      (l) =>
        `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) ||
        l.propertyAddress.toLowerCase().includes(q) ||
        l.phone.includes(q)
    );
  };

  const totalLeads = leads.filter((l) => l.status !== "LOST").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            {totalLeads} leads actifs &middot; {leads.filter((l) => l.status === "MANDATE_SIGNED").length} mandats signes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px] pl-9"
            />
          </div>
          <Button variant="outline" size="icon" onClick={resetToMock} title="Reinitialiser les donnees">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouveau lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Ajouter un lead</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Prenom *</Label>
                    <Input
                      placeholder="Jean"
                      value={newLead.firstName}
                      onChange={(e) => setNewLead({ ...newLead, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nom *</Label>
                    <Input
                      placeholder="Dupont"
                      value={newLead.lastName}
                      onChange={(e) => setNewLead({ ...newLead, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Telephone *</Label>
                    <Input
                      placeholder="06 12 34 56 78"
                      value={newLead.phone}
                      onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="jean@email.com"
                      value={newLead.email}
                      onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Adresse du bien</Label>
                  <Input
                    placeholder="12 rue de la Paix, 75002 Paris"
                    value={newLead.propertyAddress}
                    onChange={(e) => setNewLead({ ...newLead, propertyAddress: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Type de bien</Label>
                    <Select
                      value={newLead.propertyType}
                      onValueChange={(v) => setNewLead({ ...newLead, propertyType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Appartement">Appartement</SelectItem>
                        <SelectItem value="Maison">Maison</SelectItem>
                        <SelectItem value="Terrain">Terrain</SelectItem>
                        <SelectItem value="Local commercial">Local commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Surface</Label>
                    <Input
                      placeholder="65 m2"
                      value={newLead.propertySize}
                      onChange={(e) => setNewLead({ ...newLead, propertySize: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Source</Label>
                    <Select
                      value={newLead.source}
                      onValueChange={(v) => setNewLead({ ...newLead, source: v as LeadSource })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SOURCE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Negociateur</Label>
                    <Select
                      value={newLead.assignedToId}
                      onValueChange={(v) => setNewLead({ ...newLead, assignedToId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NEGOTIATORS.map((neg) => (
                          <SelectItem key={neg.id} value={neg.id}>{neg.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleAddLead}
                  disabled={!newLead.firstName || !newLead.lastName || !newLead.phone}
                  className="w-full"
                >
                  Ajouter le lead
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex min-w-max gap-3">
            {LEAD_STATUS_ORDER.map((status) => (
              <KanbanColumn
                key={status}
                id={status}
                title={STATUS_LABELS[status]}
                leads={filteredLeadsByStatus(status)}
                colorClass={STATUS_COLORS[status]}
              />
            ))}
          </div>
          <DragOverlay>
            {activeLead ? (
              <div className="w-72 rounded-lg border bg-card p-3 shadow-lg">
                <LeadCard lead={activeLead} isDragOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
