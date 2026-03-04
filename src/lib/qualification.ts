/**
 * Qualification flow: fixed questions, rule-based.
 * Used to advance lead qualification (demo or via webhook later).
 */

export const QUALIFICATION_STEPS = [
  { key: "interest", questionKey: "interest", templateBody: "Confirmez-vous votre intérêt pour ce bien ? (oui/non)" },
  { key: "visit_date", questionKey: "visit_date", templateBody: "Quand souhaitez-vous visiter ?" },
  { key: "budget", questionKey: "budget", templateBody: "Quel est votre budget ?" },
  { key: "move_in", questionKey: "move_in", templateBody: "Quand souhaitez-vous emménager ?" },
  { key: "search_type", questionKey: "search_type", templateBody: "Recherche exclusive ou multi-agences ?" },
] as const;

export type QualificationPayload = {
  interest?: string;
  visit_date?: string;
  budget?: string;
  motivation?: string;
  moveInTimeline?: string;
  searchType?: string;
  [key: string]: string | undefined;
};

export function getNextStep(currentPayload: QualificationPayload | null): (typeof QUALIFICATION_STEPS)[number] | null {
  const keys = Object.keys(currentPayload ?? {});
  const next = QUALIFICATION_STEPS.find((s) => !keys.includes(s.key));
  return next ?? null;
}

export function computeHeatScore(payload: QualificationPayload): number {
  let score = 1;
  if (payload.budget) score += 1;
  if (payload.visit_date) score += 1;
  const moveIn = (payload.moveInTimeline ?? payload.move_in ?? "").toLowerCase();
  if (moveIn && (moveIn.includes("1") || moveIn.includes("2") || moveIn.includes("mois") || moveIn.includes("immédiat"))) score += 1;
  if (payload.interest?.toLowerCase() === "oui") score += 1;
  return Math.min(5, score);
}

export function computeProspectPath(payload: QualificationPayload): "HOT" | "HESITANT" {
  const score = computeHeatScore(payload);
  const interest = (payload.interest ?? "").toLowerCase();
  if (score >= 4 && interest === "oui") return "HOT";
  return "HESITANT";
}
