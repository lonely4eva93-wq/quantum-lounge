import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface GuestState {
  id: number | null;
  alias: string;
  vibeTag: string;
  energyLevel: number;
  checkedIn: boolean;
  roomId: number | null;
}

interface GuestContextValue {
  guest: GuestState;
  setGuest: (g: Partial<GuestState>) => void;
  clearGuest: () => void;
}

const DEFAULT: GuestState = {
  id: null,
  alias: "",
  vibeTag: "",
  energyLevel: 0,
  checkedIn: false,
  roomId: null,
};

const GuestContext = createContext<GuestContextValue>({
  guest: DEFAULT,
  setGuest: () => {},
  clearGuest: () => {},
});

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const [guest, setGuestState] = useState<GuestState>(DEFAULT);

  useEffect(() => {
    AsyncStorage.getItem("ql_guest").then((raw) => {
      if (raw) {
        try {
          setGuestState(JSON.parse(raw));
        } catch {}
      }
    });
  }, []);

  const setGuest = (partial: Partial<GuestState>) => {
    setGuestState((prev) => {
      const next = { ...prev, ...partial };
      AsyncStorage.setItem("ql_guest", JSON.stringify(next));
      return next;
    });
  };

  const clearGuest = () => {
    setGuestState(DEFAULT);
    AsyncStorage.removeItem("ql_guest");
  };

  return (
    <GuestContext.Provider value={{ guest, setGuest, clearGuest }}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  return useContext(GuestContext);
}
