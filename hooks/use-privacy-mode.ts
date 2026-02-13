"use client";

import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import type { SensitiveColumn } from "@/lib/types/music-catalog";
import { SENSITIVE_COLUMNS } from "@/lib/types/music-catalog";

interface PrivacyModeState {
  enabled: boolean;
  blurredColumns: SensitiveColumn[];
}

const DEFAULT_STATE: PrivacyModeState = {
  enabled: false,
  blurredColumns: SENSITIVE_COLUMNS,
};

export function usePrivacyMode() {
  const [state, setState] = useLocalStorage<PrivacyModeState>(
    "privacy-mode",
    DEFAULT_STATE,
  );

  const togglePrivacyMode = () => {
    setState((s) => ({ ...s, enabled: !s.enabled }));
  };

  const isColumnBlurred = (column: string): boolean => {
    return (
      state.enabled && state.blurredColumns.includes(column as SensitiveColumn)
    );
  };

  return {
    privacyEnabled: state.enabled,
    blurredColumns: state.blurredColumns,
    togglePrivacyMode,
    isColumnBlurred,
  };
}
