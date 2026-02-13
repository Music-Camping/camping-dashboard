"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface PresentationContextType {
  isPresentationMode: boolean;
  setIsPresentationMode: (value: boolean) => void;
}

const PresentationContext = createContext<PresentationContextType | undefined>(
  undefined,
);

export function PresentationProvider({ children }: { children: ReactNode }) {
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  const value = useMemo(
    () => ({ isPresentationMode, setIsPresentationMode }),
    [isPresentationMode],
  );

  return (
    <PresentationContext.Provider value={value}>
      {children}
    </PresentationContext.Provider>
  );
}

export function usePresentationContext() {
  const context = useContext(PresentationContext);
  if (context === undefined) {
    throw new Error(
      "usePresentationContext must be used within a PresentationProvider",
    );
  }
  return context;
}
