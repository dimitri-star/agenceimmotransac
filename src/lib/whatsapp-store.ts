"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WhatsAppMessage } from "@/types";
import { mockWhatsAppConversations } from "./mock-whatsapp";

const SIMULATED_REPLIES = [
  "D'accord, merci pour l'info !",
  "Je vais y réfléchir et je reviens vers vous.",
  "Oui ça m'intéresse, vous pouvez m'en dire plus ?",
  "Super, je prends note.",
  "Quand est-ce qu'on pourrait se voir ?",
  "C'est noté, merci beaucoup.",
  "Parfait, ça me convient.",
];

interface WhatsAppState {
  conversations: Record<string, WhatsAppMessage[]>;
  addMessage: (leadId: string, content: string) => void;
  simulateReply: (leadId: string) => void;
  getConversation: (leadId: string) => WhatsAppMessage[];
}

export const useWhatsAppStore = create<WhatsAppState>()(
  persist(
    (set, get) => ({
      conversations: mockWhatsAppConversations,
      addMessage: (leadId, content) => {
        const msg: WhatsAppMessage = {
          id: `wa-${leadId}-${Date.now()}`,
          leadId,
          direction: "OUTBOUND",
          type: "TEXT",
          content,
          timestamp: new Date().toISOString(),
          isAutomatic: false,
        };
        set((state) => ({
          conversations: {
            ...state.conversations,
            [leadId]: [...(state.conversations[leadId] ?? []), msg],
          },
        }));
      },
      simulateReply: (leadId) => {
        setTimeout(() => {
          const reply: WhatsAppMessage = {
            id: `wa-${leadId}-reply-${Date.now()}`,
            leadId,
            direction: "INBOUND",
            type: "TEXT",
            content: SIMULATED_REPLIES[Math.floor(Math.random() * SIMULATED_REPLIES.length)],
            timestamp: new Date().toISOString(),
            isAutomatic: false,
          };
          set((state) => ({
            conversations: {
              ...state.conversations,
              [leadId]: [...(state.conversations[leadId] ?? []), reply],
            },
          }));
        }, 1500);
      },
      getConversation: (leadId) => get().conversations[leadId] ?? [],
    }),
    { name: "estimaflow-whatsapp" }
  )
);
