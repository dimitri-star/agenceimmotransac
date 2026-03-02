"use client";

import Link from "next/link";
import { useDraggable } from "@dnd-kit/core";
import type { Lead } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SOURCE_LABELS: Record<string, string> = {
  WEBSITE: "Site",
  PORTAL_SELOGER: "SeLoger",
  PORTAL_LEBONCOIN: "LeBonCoin",
  PORTAL_BIENICI: "Bien'ici",
  MANUAL: "Manuel",
  OTHER: "Autre",
};

interface LeadCardProps {
  lead: Lead;
  isDragOverlay?: boolean;
}

export function LeadCard({ lead, isDragOverlay }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: lead.id,
    disabled: isDragOverlay,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const content = (
    <>
      <div className="font-medium">
        {lead.firstName} {lead.lastName}
      </div>
      <div className="truncate text-xs text-muted-foreground">
        {lead.propertyAddress}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1">
        <Badge variant="secondary" className="text-xs">
          {SOURCE_LABELS[lead.source] ?? lead.source}
        </Badge>
        {lead.assignedTo && (
          <span className="truncate text-xs text-muted-foreground">
            {lead.assignedTo.name}
          </span>
        )}
      </div>
      {(lead.lastAction || lead.nextActionAt) && (
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          {lead.nextActionAt && (
            <span>⏰ {lead.nextActionAt}</span>
          )}
        </div>
      )}
    </>
  );

  if (isDragOverlay) {
    return (
      <div className="rounded-lg border bg-card p-3 shadow-md">{content}</div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "rounded-lg border bg-card p-3 shadow-sm transition-shadow",
        isDragging && "opacity-50 shadow-md"
      )}
    >
      <Link
        href={`/leads/${lead.id}`}
        onClick={(e) => isDragging && e.preventDefault()}
        className="block focus:outline-none"
      >
        {content}
      </Link>
    </div>
  );
}
