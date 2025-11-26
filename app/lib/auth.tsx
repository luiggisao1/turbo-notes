"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/app/lib/apiClient";

type User = { id?: string; email?: string; [k: string]: any } | null;

type AuthContextValue = {
  user: User;
  loading: boolean;
  setUser: (u: User) => void;
  loginWithTokens: (tokens: { access: string; refresh?: string }, redirectTo?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function fetchUser() {
    setLoading(true);
    try {
      // Try to get user info from backend. Use environment variable or default.
      const meUrl = (process?.env?.NEXT_PUBLIC_AUTH_ME_URL as string) || "http://localhost:8000/auth/me/";
      const res = await apiClient.fetchWithAuth(meUrl, { method: "GET" });
      if (!res.ok) {
        setUser(null);
        setLoading(false);
        return;
      }
      const data = await res.json().catch(() => null);
      setUser(data || null);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = apiClient.getAccessToken();
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  async function loginWithTokens(tokens: { access: string; refresh?: string }, redirectTo?: string) {
    await apiClient.setTokens({ access: tokens.access, refresh: tokens.refresh });
    await fetchUser();
    if (redirectTo) router.replace(redirectTo);
  }

  function logout() {
    apiClient.logout();
    setUser(null);
    router.replace("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, loginWithTokens, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
