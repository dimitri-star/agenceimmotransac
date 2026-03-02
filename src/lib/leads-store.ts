"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lead, LeadStatus } from "@/types";
import { mockLeads, LEAD_STATUS_ORDER } from "./mock-leads";

interface LeadsState {
  leads: Lead[];
  setLeadStatus: (leadId: string, status: LeadStatus, lostReason?: string) => void;
  getLeadsByStatus: (status: LeadStatus) => Lead[];
  getLeadById: (id: string) => Lead | undefined;
  resetToMock: () => void;
}

export const useLeadsStore = create<LeadsState>()(
  persist(
    (set, get) => ({
      leads: mockLeads,
      setLeadStatus: (leadId, status, lostReason) => {
        set((state) => ({
          leads: state.leads.map((l) =>
            l.id === leadId
              ? {
                  ...l,
                  status,
                  ...(status === "LOST" && lostReason ? { lostReason } : {}),
                  updatedAt: new Date().toISOString(),
                }
              : l
          ),
        }));
      },
      getLeadsByStatus: (status) => {
        return get().leads.filter((l) => l.status === status);
      },
      getLeadById: (id) => get().leads.find((l) => l.id === id),
      resetToMock: () => set({ leads: mockLeads }),
    }),
    { name: "estimaflow-leads" }
  )
);

export { LEAD_STATUS_ORDER };
