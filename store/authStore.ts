import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
    id: number;
    name: string;
    email: string;
    token: string;
    role: string;
};

type Tenant = Record<string, unknown>;

interface AuthState {
  token: string | null;
  name: string | null;
  email: string | null;
  role: string | null;

  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  login: (data: {
    token: string;
    name: string;
    email: string;
    role: string;
  }) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      name: null,
      email: null,
      role: null,

      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      login: ({ token, name, email, role }) => {
        // ✅ Save token in cookie
        if (typeof document !== "undefined") {
          document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
        }

        set({
          token,
          name,
          email,
          role,
        });
      },

      logout: () => {
        if (typeof document !== "undefined") {
          document.cookie = "auth-token=; path=/; max-age=0";
        }

        set({
          token: null,
          name: null,
          email: null,
          role: null,
        });
      },
    }),
    
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);