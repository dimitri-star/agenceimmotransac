"use client";

import { useCallback } from "react";
import Link from "next/link";
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
import type { Lead, LeadStatus } from "@/types";
import { KanbanColumn } from "@/components/pipeline/kanban-column";
import { LeadCard } from "@/components/pipeline/lead-card";
import { useState } from "react";

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Nouveau",
  IN_CONTACT: "En contact",
  APPOINTMENT_SET: "RDV programmé",
  ESTIMATION_DONE: "Estimation faite",
  MANDATE_SIGNED: "Mandat signé",
  LOST: "Perdu",
};

export default function PipelinePage() {
  const { leads, setLeadStatus, getLeadsByStatus } = useLeadsStore();
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Pipeline</h1>
      <div className="overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex min-w-max gap-4">
            {LEAD_STATUS_ORDER.map((status) => (
              <KanbanColumn
                key={status}
                id={status}
                title={STATUS_LABELS[status]}
                leads={getLeadsByStatus(status)}
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
