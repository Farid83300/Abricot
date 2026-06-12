"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  clearToken,
  getProfile,
  getToken,
  login as apiLogin,
  register as apiRegister,
  setToken,
} from "@/lib/api";
import type { LoginPayload, RegisterPayload, User } from "@/types/api";

// ============================================================
// Forme du contexte
// ============================================================

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================================
// Provider
// ============================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // true tant qu'on n'a pas vérifié s'il existe un token valide
  const [isLoading, setIsLoading] = useState(true);

  // Au premier rendu : si un token existe, on tente de récupérer
  // le profil pour restaurer la session après un rechargement de page.
  useEffect(() => {
    const token = getToken();

    if (!token) {
      // Règle trop stricte pour ce pattern standard "vérifier la session au montage" :
      // cf. https://github.com/facebook/react/issues/34743
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }

    getProfile()
      .then((profile) => setUser(profile))
      .catch(() => {
        // Token invalide ou expiré : on nettoie.
        clearToken();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(payload: LoginPayload) {
    const { token, user: loggedInUser } = await apiLogin(payload);
    setToken(token);
    setUser(loggedInUser);
  }

  async function register(payload: RegisterPayload) {
    const { token, user: newUser } = await apiRegister(payload);
    setToken(token);
    setUser(newUser);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// Hook de consommation
// ============================================================

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>");
  }

  return context;
}
