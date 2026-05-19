import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
   id?: number | string;
  name?: string;
  email?: string;
  role?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  
  login: (data: { token: string; role?: string; name?: string; email?: string; id?: number }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (data) => {
        set({
          token: data.token,
          user: {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
          },
          isAuthenticated: true,
        });
        
        // Store in localStorage for persistence
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", data.role || "");
        localStorage.setItem("userId", String(data.id || ""));
        localStorage.setItem("userName", data.name || "");
        localStorage.setItem("userEmail", data.email || "");
      },

      logout: () => {
        localStorage.clear();
        sessionStorage.clear();
        
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,
    }
  )
);