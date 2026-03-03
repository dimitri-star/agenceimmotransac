"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lead, LeadStatus } from "@/types";
import { mockLeads, LEAD_STATUS_ORDER } from "./mock-leads";

interface NewLeadInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  propertyAddress: string;
  propertyType?: string;
  propertySize?: string;
  source: Lead["source"];
  assignedTo?: { id: string; name: string };
}

interface StatusChangeExtras {
  lostReason?: string;
  estimatedValue?: number;
  mandateType?: "EXCLUSIVE" | "SIMPLE";
}

interface LeadsState {
  leads: Lead[];
  setLeadStatus: (leadId: string, status: LeadStatus, extras?: StatusChangeExtras) => void;
  getLeadsByStatus: (status: LeadStatus) => Lead[];
  getLeadById: (id: string) => Lead | undefined;
  addLead: (input: NewLeadInput) => void;
  resetToMock: () => void;
}

export const useLeadsStore = create<LeadsState>()(
  persist(
    (set, get) => ({
      leads: mockLeads,
      setLeadStatus: (leadId, status, extras) => {
        set((state) => ({
          leads: state.leads.map((l) =>
            l.id === leadId
              ? {
                  ...l,
                  status,
                  ...(status === "LOST" && extras?.lostReason ? { lostReason: extras.lostReason } : {}),
                  ...(status === "ESTIMATION_DONE" && extras?.estimatedValue ? { estimatedValue: extras.estimatedValue } : {}),
                  ...(status === "MANDATE_SIGNED" && extras?.mandateType ? { mandateType: extras.mandateType } : {}),
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
      addLead: (input) => {
        const now = new Date().toISOString();
        const newLead: Lead = {
          id: `lead-${Date.now()}`,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          propertyAddress: input.propertyAddress,
          propertyType: input.propertyType,
          propertySize: input.propertySize,
          source: input.source,
          status: "NEW",
          assignedTo: input.assignedTo,
          lastAction: "Lead cree",
          nextActionAt: "SMS auto",
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ leads: [newLead, ...state.leads] }));
      },
      resetToMock: () => set({ leads: mockLeads }),
    }),
    { name: "estimaflow-leads" }
  )
);

export { LEAD_STATUS_ORDER };
