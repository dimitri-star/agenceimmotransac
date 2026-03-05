"use client";

import Link from "next/link";
import { useDraggable } from "@dnd-kit/core";
import type { Lead } from "@/types";
import { cn } from "@/lib/utils";
import { Clock, User, Flame, MessageCircle } from "lucide-react";

const SOURCE_LABELS: Record<string, string> = {
  WEBSITE: "Site",
  PORTAL_SELOGER: "SeLoger",
  PORTAL_LEBONCOIN: "LeBonCoin",
  PORTAL_BIENICI: "Bien'ici",
  MANUAL: "Manuel",
  OTHER: "Autre",
};

const SOURCE_COLORS: Record<string, string> = {
  WEBSITE: "bg-blue-100 text-blue-800 border-blue-200",
  PORTAL_SELOGER: "bg-red-100 text-red-800 border-red-200",
  PORTAL_LEBONCOIN: "bg-orange-100 text-orange-800 border-orange-200",
  PORTAL_BIENICI: "bg-violet-100 text-violet-800 border-violet-200",
  MANUAL: "bg-gray-100 text-gray-800 border-gray-200",
  OTHER: "bg-gray-100 text-gray-600 border-gray-200",
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
      <div className="flex items-start justify-between gap-1">
        <div className="font-medium text-sm leading-tight">
          {lead.firstName} {lead.lastName}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {lead.qualification?.heatScore && (
            <span className="flex items-center">
              {Array.from({ length: lead.qualification.heatScore }).map((_, i) => (
                <Flame key={i} className="h-2.5 w-2.5 text-orange-500" fill="currentColor" />
              ))}
            </span>
          )}
          {lead.estimatedValue && (
            <span className="text-xs font-bold text-emerald-700">
              {(lead.estimatedValue / 1000).toFixed(0)}k
            </span>
          )}
        </div>
      </div>
      <div className="mt-0.5 truncate text-xs text-muted-foreground">
        {lead.propertyAddress}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        <span className={cn("inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium border", SOURCE_COLORS[lead.source] ?? SOURCE_COLORS.OTHER)}>
          {SOURCE_LABELS[lead.source] ?? lead.source}
        </span>
        {lead.mandateType && (
          <span className="inline-flex rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 border border-emerald-200">
            {lead.mandateType === "EXCLUSIVE" ? "Exclusif" : "Simple"}
          </span>
        )}
        {lead.status === "IN_WHATSAPP_CONVERSATION" && (
          <span className="inline-flex items-center gap-0.5 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-800 border border-green-200">
            <MessageCircle className="h-2.5 w-2.5" /> WhatsApp
          </span>
        )}
        {lead.prospectPath && (
          <span className={cn(
            "inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium border",
            lead.prospectPath === "HOT"
              ? "bg-red-100 text-red-700 border-red-200"
              : "bg-amber-100 text-amber-700 border-amber-200"
          )}>
            {lead.prospectPath === "HOT" ? "Chaud" : "Hésitant"}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        {lead.assignedTo && (
          <span className="flex items-center gap-1 truncate">
            <User className="h-3 w-3" />
            {lead.assignedTo.name}
          </span>
        )}
        {lead.nextActionAt && (
          <span className="flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3" />
            {lead.nextActionAt}
          </span>
        )}
      </div>
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
        "rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md",
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
