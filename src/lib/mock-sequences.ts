import type { Sequence, SequenceStep } from "@/types";

export const mockSequences: Sequence[] = [
  {
    id: "seq-1",
    name: "Nouveau lead",
    triggerStatus: "NEW",
    isActive: true,
    steps: [
      { id: "s1", order: 1, delayDays: 0, delayHours: 0, channel: "SMS", templateContent: "Bonjour {prénom}, merci pour votre demande d'estimation pour {adresse_bien}. {nom_négociateur} vous contacte très vite." },
      { id: "s2", order: 2, delayDays: 1, delayHours: 0, channel: "SMS", templateContent: "Bonjour {prénom}, avez-vous des questions sur l'estimation de votre bien ?" },
      { id: "s3", order: 3, delayDays: 3, delayHours: 0, channel: "EMAIL", templateContent: "Guide estimation et tendances marché local...", subject: "Votre estimation immobilière" },
      { id: "s4", order: 4, delayDays: 7, delayHours: 0, channel: "MANUAL_TASK", templateContent: "Relance finale - appeler le lead" },
    ],
  },
  {
    id: "seq-2",
    name: "Post-estimation sans mandat",
    triggerStatus: "ESTIMATION_DONE",
    isActive: true,
    steps: [
      { id: "s5", order: 1, delayDays: 1, delayHours: 0, channel: "EMAIL", templateContent: "Merci de nous avoir reçu, voici le récap de l'estimation.", subject: "Récapitulatif de votre estimation" },
      { id: "s6", order: 2, delayDays: 5, delayHours: 0, channel: "SMS", templateContent: "Avez-vous réfléchi ? Nous restons disponibles pour toute question." },
      { id: "s7", order: 3, delayDays: 15, delayHours: 0, channel: "EMAIL", templateContent: "Argument marché et relance.", subject: "Où en êtes-vous ?" },
      { id: "s8", order: 4, delayDays: 30, delayHours: 0, channel: "SMS", templateContent: "Dernier message - nous restons à disposition." },
    ],
  },
  {
    id: "seq-3",
    name: "No-show",
    triggerStatus: "APPOINTMENT_SET",
    isActive: true,
    steps: [
      { id: "s9", order: 1, delayDays: 0, delayHours: 1, channel: "SMS", templateContent: "Nous avons remarqué que vous n'avez pas pu être présent au RDV. Souhaitez-vous reprendre rendez-vous ?" },
      { id: "s10", order: 2, delayDays: 1, delayHours: 0, channel: "MANUAL_TASK", templateContent: "Appel planifié - rappeler le lead" },
      { id: "s11", order: 3, delayDays: 3, delayHours: 0, channel: "EMAIL", templateContent: "Relance après absence au RDV.", subject: "Reprendre rendez-vous" },
    ],
  },
];

export const PREVIEW_VARS = {
  prénom: "Jean",
  adresse_bien: "12 rue de la Paix, 75002 Paris",
  nom_agence: "Agence Demo",
  nom_négociateur: "Marie Martin",
};

export function applyPreviewVars(text: string): string {
  let result = text;
  for (const [key, value] of Object.entries(PREVIEW_VARS)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return result;
}
