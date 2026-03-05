import type { RelanceItem } from "@/types";

export const mockRelances: RelanceItem[] = [
  // NO_RESPONSE - Leads sans réponse
  {
    id: "rel-1",
    leadId: "7",
    leadName: "Thomas Moreau",
    type: "NO_RESPONSE",
    daysSinceLastAction: 12,
    suggestedAction: "Relance WhatsApp avec offre d'estimation gratuite",
    heatScore: 1,
    propertyAddress: "7 rue de la Pompe, 75116 Paris",
    assignedTo: "Jean Négociateur",
  },
  {
    id: "rel-2",
    leadId: "3",
    leadName: "Pierre Martin",
    type: "NO_RESPONSE",
    daysSinceLastAction: 3,
    suggestedAction: "SMS de relance + appel",
    heatScore: 3,
    propertyAddress: "5 rue du Commerce, 75015 Paris",
    assignedTo: "Jean Négociateur",
  },

  // NO_APPOINTMENT - Qualifiés sans RDV
  {
    id: "rel-3",
    leadId: "9",
    leadName: "Antoine Dubois",
    type: "NO_APPOINTMENT",
    daysSinceLastAction: 5,
    suggestedAction: "Envoyer un nouveau listing + proposition de RDV",
    heatScore: 2,
    propertyAddress: "10 rue de Ménilmontant, 75020 Paris",
    assignedTo: "Jean Négociateur",
  },
  {
    id: "rel-4",
    leadId: "2",
    leadName: "Sophie Leroy",
    type: "NO_APPOINTMENT",
    daysSinceLastAction: 2,
    suggestedAction: "Rappel Calendly + WhatsApp",
    heatScore: 4,
    propertyAddress: "8 avenue des Champs, 75008 Paris",
    assignedTo: "Marie Martin",
  },

  // UNCONFIRMED_RDV - RDV non confirmés
  {
    id: "rel-5",
    leadId: "4",
    leadName: "Marie Bernard",
    type: "UNCONFIRMED_RDV",
    daysSinceLastAction: 1,
    suggestedAction: "SMS de confirmation du RDV du 05/03",
    heatScore: 4,
    propertyAddress: "3 place de la République, 69003 Lyon",
    assignedTo: "Marie Martin",
  },

  // ESTIMATION_NOT_SIGNED - Estimations sans mandat
  {
    id: "rel-6",
    leadId: "5",
    leadName: "Luc Petit",
    type: "ESTIMATION_NOT_SIGNED",
    daysSinceLastAction: 7,
    suggestedAction: "Relance avec comparatif marché + urgence",
    heatScore: 3,
    propertyAddress: "20 boulevard Haussmann, 75009 Paris",
    assignedTo: "Jean Négociateur",
  },
  {
    id: "rel-7",
    leadId: "6",
    leadName: "Claire Durand",
    type: "ESTIMATION_NOT_SIGNED",
    daysSinceLastAction: 10,
    suggestedAction: "Appel de suivi post-mandat",
    propertyAddress: "15 rue de Rivoli, 75001 Paris",
    assignedTo: "Marie Martin",
  },
];

export const RELANCE_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  NO_RESPONSE: { label: "Sans réponse", color: "text-red-700", bg: "bg-red-100" },
  NO_APPOINTMENT: { label: "Sans RDV", color: "text-amber-700", bg: "bg-amber-100" },
  UNCONFIRMED_RDV: { label: "RDV non confirmé", color: "text-violet-700", bg: "bg-violet-100" },
  ESTIMATION_NOT_SIGNED: { label: "Estimation non signée", color: "text-orange-700", bg: "bg-orange-100" },
};
