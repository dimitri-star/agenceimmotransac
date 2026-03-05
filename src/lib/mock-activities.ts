import type { Activity } from "@/types";

export const mockActivitiesByLead: Record<string, Activity[]> = {
  "1": [
    { id: "a1", leadId: "1", type: "SMS_SENT", description: "SMS de bienvenue envoyé", createdAt: "2026-03-02T09:00:00Z", userName: "Système" },
    { id: "a2", leadId: "1", type: "EMAIL_SENT", description: "Email de confirmation envoyé", createdAt: "2026-03-02T09:01:00Z", userName: "Système" },
    { id: "a1b", leadId: "1", type: "WHATSAPP_SENT", description: "WhatsApp de bienvenue envoyé (triple contact)", createdAt: "2026-03-02T09:02:00Z", userName: "Système" },
  ],
  "2": [
    { id: "a3", leadId: "2", type: "EMAIL_SENT", description: "Email de confirmation envoyé", createdAt: "2026-03-01T14:30:00Z", userName: "Système" },
    { id: "a3b", leadId: "2", type: "WHATSAPP_SENT", description: "WhatsApp de bienvenue envoyé", createdAt: "2026-03-01T14:31:00Z", userName: "Système" },
  ],
  "3": [
    { id: "a4", leadId: "3", type: "STATUS_CHANGE", description: "Statut passé à En contact", createdAt: "2026-03-02T08:00:00Z", userName: "Jean Négociateur" },
    { id: "a5", leadId: "3", type: "CALL", description: "Appel téléphonique - 5 min", createdAt: "2026-03-02T08:05:00Z", userName: "Jean Négociateur" },
    { id: "a6", leadId: "3", type: "NOTE", description: "Client intéressé, dispo pour RDV en fin de semaine", createdAt: "2026-03-02T08:10:00Z", userName: "Jean Négociateur" },
  ],
  "4": [
    { id: "a7", leadId: "4", type: "APPOINTMENT", description: "RDV programmé le 05/03 à 14h", createdAt: "2026-03-01T16:00:00Z", userName: "Marie Martin" },
    { id: "a8", leadId: "4", type: "STATUS_CHANGE", description: "Statut passé à RDV programmé", createdAt: "2026-03-01T16:00:00Z", userName: "Marie Martin" },
  ],
  "5": [
    { id: "a9", leadId: "5", type: "STATUS_CHANGE", description: "Estimation faite - 450 000 €", createdAt: "2026-02-28T17:00:00Z", userName: "Jean Négociateur" },
    { id: "a10", leadId: "5", type: "NOTE", description: "Visite effectuée, bien en bon état", createdAt: "2026-02-28T17:30:00Z", userName: "Jean Négociateur" },
  ],
  "6": [
    { id: "a11", leadId: "6", type: "STATUS_CHANGE", description: "Mandat exclusif signé", createdAt: "2026-02-25T14:00:00Z", userName: "Marie Martin" },
  ],
  "7": [
    { id: "a12", leadId: "7", type: "STATUS_CHANGE", description: "Lead marqué Perdu - Injoignable", createdAt: "2026-02-20T12:00:00Z", userName: "Jean Négociateur" },
    { id: "a13", leadId: "7", type: "SMS_SENT", description: "Dernière relance SMS envoyée", createdAt: "2026-02-19T10:00:00Z", userName: "Système" },
  ],
  "8": [
    { id: "a14", leadId: "8", type: "SMS_SENT", description: "SMS de bienvenue envoyé (triple contact)", createdAt: "2026-03-02T11:30:00Z", userName: "Système" },
    { id: "a15", leadId: "8", type: "EMAIL_SENT", description: "Email de confirmation envoyé (triple contact)", createdAt: "2026-03-02T11:30:00Z", userName: "Système" },
    { id: "a16", leadId: "8", type: "WHATSAPP_SENT", description: "WhatsApp de qualification envoyé (triple contact)", createdAt: "2026-03-02T11:30:00Z", userName: "Système" },
    { id: "a17", leadId: "8", type: "STATUS_CHANGE", description: "Statut passé à Conversation WhatsApp", createdAt: "2026-03-02T11:45:00Z", userName: "Système" },
  ],
  "9": [
    { id: "a18", leadId: "9", type: "WHATSAPP_SENT", description: "WhatsApp de qualification envoyé", createdAt: "2026-02-27T08:30:00Z", userName: "Système" },
    { id: "a19", leadId: "9", type: "STATUS_CHANGE", description: "Statut passé à Qualifié (hésitant)", createdAt: "2026-03-01T10:00:00Z", userName: "Système" },
    { id: "a19b", leadId: "9", type: "WHATSAPP_SENT", description: "Listing de biens envoyé par WhatsApp", createdAt: "2026-02-27T14:02:00Z", userName: "Système" },
  ],
  "10": [
    { id: "a20", leadId: "10", type: "WHATSAPP_SENT", description: "WhatsApp de qualification envoyé", createdAt: "2026-03-01T07:30:00Z", userName: "Système" },
    { id: "a21", leadId: "10", type: "STATUS_CHANGE", description: "Statut passé à Qualifié (prospect chaud)", createdAt: "2026-03-02T09:30:00Z", userName: "Système" },
    { id: "a22", leadId: "10", type: "CALENDLY_SENT", description: "Lien Calendly envoyé par WhatsApp", createdAt: "2026-03-01T07:47:00Z", userName: "Système" },
  ],
};

export const mockSequenceByLead: Record<string, { name: string; step: number; nextAction: string }> = {
  "1": { name: "Triple contact", step: 1, nextAction: "J+1 : Relance WhatsApp" },
  "2": { name: "Triple contact", step: 2, nextAction: "J+3 : Email" },
  "3": { name: "Nouveau lead", step: 0, nextAction: "Séquence en pause (en contact)" },
  "4": { name: "—", step: 0, nextAction: "—" },
  "5": { name: "Post-estimation sans mandat", step: 2, nextAction: "J+15 : Email relance" },
  "6": { name: "—", step: 0, nextAction: "Mandat signé" },
  "7": { name: "—", step: 0, nextAction: "—" },
  "8": { name: "Qualification WhatsApp", step: 3, nextAction: "Réponse en attente" },
  "9": { name: "Relance hésitant", step: 1, nextAction: "J+3 : WhatsApp listing" },
  "10": { name: "—", step: 0, nextAction: "Calendly envoyé - RDV à confirmer" },
};
