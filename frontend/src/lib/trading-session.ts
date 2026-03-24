"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const STORAGE_KEY = "oss-market-trading-session-v1";

export type TradingSession = {
  username: string;
  accessToken: string;
  kind: "member";
};

function readSession(): TradingSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as TradingSession | { kind?: string };
    if (session.kind !== "member") return null;
    return session as TradingSession;
  } catch {
    return null;
  }
}

function writeSession(session: TradingSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("oss-market-session-change"));
}

export function getTradingSession() {
  return readSession();
}

export function useTradingSessionState() {
  const [session, setSession] = useState<TradingSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    function syncSession() {
      setSession(readSession());
      setHydrated(true);
    }

    syncSession();
    window.addEventListener("storage", syncSession);
    window.addEventListener("oss-market-session-change", syncSession);

    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener("oss-market-session-change", syncSession);
    };
  }, []);

  return { session, hydrated };
}

export function clearTradingSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("oss-market-session-change"));
}

export async function loginTradingSession(body: {
  username: string;
  password: string;
}) {
  const response = await api.auth.login(body);
  const session = {
    username: body.username,
    accessToken: response.access_token,
    kind: "member" as const,
  };
  writeSession(session);
  return session;
}

export async function registerTradingSession(body: {
  username: string;
  email: string;
  display_name: string;
  password: string;
}) {
  return api.auth.register(body);
}
