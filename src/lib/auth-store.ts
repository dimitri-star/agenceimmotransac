"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "NEGOTIATOR";
  agencyId: string;
  agencyName: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

// Mock: accept demo@estimaflow.fr / password for Phase 1
const MOCK_CREDENTIALS = {
  email: "demo@estimaflow.fr",
  password: "password",
};

const MOCK_USER: AuthUser = {
  id: "u0",
  name: "Admin Demo",
  email: "demo@estimaflow.fr",
  role: "ADMIN",
  agencyId: "agency-1",
  agencyName: "Agence Demo",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (email: string, password: string) => {
        if (
          email === MOCK_CREDENTIALS.email &&
          password === MOCK_CREDENTIALS.password
        ) {
          set({ user: MOCK_USER, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: "estimaflow-auth" }
  )
);
