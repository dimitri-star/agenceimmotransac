// Lead & pipeline
export type LeadStatus =
  | "NEW"
  | "IN_WHATSAPP_CONVERSATION"
  | "QUALIFIED"
  | "IN_CONTACT"
  | "APPOINTMENT_SET"
  | "ESTIMATION_DONE"
  | "MANDATE_SIGNED"
  | "LOST";

export type LeadSource =
  | "WEBSITE"
  | "PORTAL_SELOGER"
  | "PORTAL_LEBONCOIN"
  | "PORTAL_BIENICI"
  | "MANUAL"
  | "OTHER";

export type ActivityType =
  | "STATUS_CHANGE"
  | "NOTE"
  | "CALL"
  | "SMS_SENT"
  | "EMAIL_SENT"
  | "WHATSAPP_SENT"
  | "CALENDLY_SENT"
  | "APPOINTMENT"
  | "MANUAL_TASK";

export type SequenceChannel = "SMS" | "EMAIL" | "WHATSAPP" | "MANUAL_TASK";

// WhatsApp & Qualification
export type QualificationStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type ProspectPath = "HOT" | "HESITANT";
export type WhatsAppMessageType = "TEXT" | "TEMPLATE" | "CALENDLY_LINK" | "PROPERTY_LISTING";
export type RelanceType = "NO_RESPONSE" | "NO_APPOINTMENT" | "UNCONFIRMED_RDV" | "ESTIMATION_NOT_SIGNED";

export interface LeadQualification {
  status: QualificationStatus;
  budget?: string;
  motivation?: string;
  heatScore?: number; // 1-5
  moveInTimeline?: string;
  searchType?: string;
  completedAt?: string;
}

export interface WhatsAppMessage {
  id: string;
  leadId: string;
  direction: "INBOUND" | "OUTBOUND";
  type: WhatsAppMessageType;
  content: string;
  timestamp: string;
  isAutomatic: boolean;
  metadata?: Record<string, string>;
}

export interface RelanceItem {
  id: string;
  leadId: string;
  leadName: string;
  type: RelanceType;
  daysSinceLastAction: number;
  suggestedAction: string;
  heatScore?: number;
  propertyAddress?: string;
  assignedTo?: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  propertyType?: string;
  propertySize?: string;
  source: LeadSource;
  status: LeadStatus;
  lostReason?: string;
  estimatedValue?: number;
  mandateType?: "EXCLUSIVE" | "SIMPLE";
  notes?: string;
  assignedTo?: { id: string; name: string };
  lastAction?: string;
  nextActionAt?: string;
  qualification?: LeadQualification;
  prospectPath?: ProspectPath;
  calendlyLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  leadId: string;
  type: ActivityType;
  description: string;
  createdAt: string;
  userName?: string;
}

export interface SequenceStep {
  id: string;
  order: number;
  delayDays: number;
  delayHours: number;
  channel: SequenceChannel;
  templateContent: string;
  subject?: string;
}

export interface Sequence {
  id: string;
  name: string;
  triggerStatus: LeadStatus;
  isActive: boolean;
  steps: SequenceStep[];
}

export interface SequenceExecution {
  id: string;
  sequenceId: string;
  sequenceName: string;
  currentStep: number;
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  nextExecutionAt?: string;
  nextActionLabel?: string;
}

export interface DashboardKpis {
  leadsThisMonth: number;
  appointmentsScheduled: number;
  mandatesSigned: number;
  conversionRate: number;
  qualifiedLeads: number;
  estimatedRevenue: number;
  automationGeneratedRevenue: number;
}

export interface FunnelStage {
  label: string;
  count: number;
  percentage: number;
}

export interface UrgentAction {
  id: string;
  type: "leads_to_follow_up" | "unconfirmed_rdv" | "estimations_not_converted";
  count: number;
  label: string;
  href: string;
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "NEGOTIATOR";
}

export interface MockAgency {
  id: string;
  name: string;
  logoUrl?: string;
  primaryColor: string;
  smsSenderName: string;
  emailFrom: string;
}
