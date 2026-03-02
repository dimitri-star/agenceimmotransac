"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Lead, LeadStatus } from "@/types";
import { LeadCard } from "./lead-card";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: LeadStatus;
  title: string;
  leads: Lead[];
}

export function KanbanColumn({ id, title, leads }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full min-h-[400px] w-72 shrink-0 flex-col rounded-lg border bg-muted/30 transition-colors",
        isOver && "bg-muted/60"
      )}
    >
      <div className="flex items-center justify-between border-b p-3">
        <span className="font-medium">{title}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-sm font-medium">
          {leads.length}
        </span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}
