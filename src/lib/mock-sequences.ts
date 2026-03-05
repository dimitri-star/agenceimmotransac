import type { Sequence } from "@/types";

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
  {
    id: "seq-4",
    name: "Triple contact instantané",
    triggerStatus: "NEW",
    isActive: true,
    steps: [
      { id: "s12", order: 1, delayDays: 0, delayHours: 0, channel: "EMAIL", templateContent: "Bonjour {prénom}, merci pour votre demande d'estimation. Nous avons bien reçu votre demande pour {adresse_bien}.", subject: "Votre demande d'estimation - {nom_agence}" },
      { id: "s13", order: 2, delayDays: 0, delayHours: 0, channel: "SMS", templateContent: "Bonjour {prénom} ! Votre demande pour {adresse_bien} a été reçue. {nom_négociateur} vous contacte rapidement." },
      { id: "s14", order: 3, delayDays: 0, delayHours: 0, channel: "WHATSAPP", templateContent: "Bonjour {prénom} ! Merci pour votre demande d'estimation pour {adresse_bien}. Je suis {nom_négociateur} de {nom_agence}. Puis-je vous poser quelques questions pour mieux comprendre votre projet ?" },
    ],
  },
  {
    id: "seq-5",
    name: "Qualification WhatsApp",
    triggerStatus: "IN_WHATSAPP_CONVERSATION",
    isActive: true,
    steps: [
      { id: "s15", order: 1, delayDays: 0, delayHours: 0, channel: "WHATSAPP", templateContent: "Quel est votre budget approximatif pour ce projet ?" },
      { id: "s16", order: 2, delayDays: 0, delayHours: 1, channel: "WHATSAPP", templateContent: "Quelle est votre motivation principale ? (vente, investissement, mutation...)" },
      { id: "s17", order: 3, delayDays: 0, delayHours: 2, channel: "WHATSAPP", templateContent: "Dans quel délai souhaitez-vous concrétiser votre projet ?" },
      { id: "s18", order: 4, delayDays: 1, delayHours: 0, channel: "WHATSAPP", templateContent: "Merci pour vos réponses ! Je vous prépare une proposition adaptée." },
    ],
  },
  {
    id: "seq-6",
    name: "Relance prospect hésitant",
    triggerStatus: "QUALIFIED",
    isActive: true,
    steps: [
      { id: "s19", order: 1, delayDays: 3, delayHours: 0, channel: "WHATSAPP", templateContent: "Bonjour {prénom}, j'ai trouvé des biens qui pourraient correspondre à votre recherche. Voulez-vous que je vous les envoie ?" },
      { id: "s20", order: 2, delayDays: 7, delayHours: 0, channel: "EMAIL", templateContent: "Voici une sélection de biens qui correspondent à votre profil...", subject: "Biens sélectionnés pour vous" },
      { id: "s21", order: 3, delayDays: 14, delayHours: 0, channel: "WHATSAPP", templateContent: "Bonjour {prénom}, avez-vous pu regarder les biens que je vous ai envoyés ? Je suis disponible pour en discuter." },
      { id: "s22", order: 4, delayDays: 30, delayHours: 0, channel: "SMS", templateContent: "Bonjour {prénom}, nous avons de nouvelles opportunités. N'hésitez pas à revenir vers nous !" },
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
