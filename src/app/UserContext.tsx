"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ReactNode } from "react";

interface UserContextType {
  user: { id: number; name: string } | null;
  hydrated: boolean;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    setHydrated(true);
  }, []);

  return (
    <UserContext.Provider value={{ user, hydrated }}>{children}</UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);