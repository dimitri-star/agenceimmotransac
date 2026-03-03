"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Lead, LeadStatus } from "@/types";
import { LeadCard } from "./lead-card";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: LeadStatus;
  title: string;
  leads: Lead[];
  colorClass?: string;
}

export function KanbanColumn({ id, title, leads, colorClass }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full min-h-[420px] w-72 shrink-0 flex-col rounded-lg border border-t-[3px] bg-muted/30 transition-colors",
        colorClass ?? "border-t-gray-400",
        isOver && "bg-muted/60 ring-2 ring-primary/20"
      )}
    >
      <div className="flex items-center justify-between border-b px-3 py-2.5">
        <span className="text-sm font-semibold">{title}</span>
        <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-muted px-1.5 text-xs font-bold">
          {leads.length}
        </span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {leads.length === 0 && (
          <div className="flex h-20 items-center justify-center text-xs text-muted-foreground">
            Aucun lead
          </div>
        )}
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}
