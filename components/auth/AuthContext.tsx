"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserProfile, UserSettingsType, UserRole } from "@/types";
import { getSocket, disconnectSocket } from "@/lib/socket";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
  settings?: UserSettingsType;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (data: { identifier: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    displayName: string;
    username: string;
    bio?: string;
    avatar?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  deleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateSettings: (settings: Partial<UserSettingsType>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const syncSocket = useCallback((jwtToken?: string | null) => {
    try {
      const socket = getSocket();
      if (jwtToken) {
        socket.emit("auth:identify", { token: jwtToken });
      }
    } catch (e) {
      console.warn("Socket sync warning:", e);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const savedToken = typeof window !== "undefined" ? localStorage.getItem("chatflow_token") : null;
      const headers: Record<string, string> = {};
      if (savedToken) {
        headers["Authorization"] = `Bearer ${savedToken}`;
      }

      const res = await fetch("/api/auth/me", { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          if (typeof window !== "undefined") {
            localStorage.setItem("chatflow_user", JSON.stringify(data.user));
          }
          if (savedToken) {
            setToken(savedToken);
            syncSocket(savedToken);
          }
        } else {
          setUser(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("chatflow_user");
            localStorage.removeItem("chatflow_token");
          }
        }
      } else {
        if (!savedToken) {
          setUser(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("chatflow_user");
          }
        }
      }
    } catch (err) {
      console.warn("Auth check network error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [syncSocket]);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("chatflow_user");
      const savedToken = localStorage.getItem("chatflow_token");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      if (savedToken) {
        setToken(savedToken);
        syncSocket(savedToken);
      }
    } catch (e) {}
    refreshUser();
  }, [refreshUser, syncSocket]);

  const login = async (credentials: { identifier: string; password: string }) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Login failed" };
      }

      setUser(data.user);
      if (typeof window !== "undefined") {
        localStorage.setItem("chatflow_user", JSON.stringify(data.user));
      }
      if (data.token) {
        setToken(data.token);
        localStorage.setItem("chatflow_token", data.token);
        syncSocket(data.token);
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  };

  const register = async (formData: {
    email: string;
    password: string;
    displayName: string;
    username: string;
    bio?: string;
    avatar?: string;
  }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Registration failed" };
      }

      setUser(data.user);
      if (typeof window !== "undefined") {
        localStorage.setItem("chatflow_user", JSON.stringify(data.user));
      }
      if (data.token) {
        setToken(data.token);
        localStorage.setItem("chatflow_token", data.token);
        syncSocket(data.token);
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // Ignore
    } finally {
      setUser(null);
      setToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("chatflow_token");
        localStorage.removeItem("chatflow_user");
      }
      disconnectSocket();
      window.location.href = "/login";
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      const savedToken = typeof window !== "undefined" ? localStorage.getItem("chatflow_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (savedToken) {
        headers["Authorization"] = `Bearer ${savedToken}`;
      }

      const res = await fetch("/api/users/account", {
        method: "DELETE",
        headers,
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Failed to delete account" };
      }

      setUser(null);
      setToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("chatflow_token");
        localStorage.removeItem("chatflow_user");
      }
      disconnectSocket();
      window.location.href = "/login?deleted=true";
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Network error while deleting account" };
    }
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      profile: {
        ...user.profile,
        ...updated,
      },
    };
    setUser(updatedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("chatflow_user", JSON.stringify(updatedUser));
    }
  };

  const updateSettings = (updated: Partial<UserSettingsType>) => {
    if (!user || !user.settings) return;
    const updatedUser = {
      ...user,
      settings: {
        ...user.settings,
        ...updated,
      },
    };
    setUser(updatedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("chatflow_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        deleteAccount,
        refreshUser,
        updateProfile,
        updateSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
