"use client";

import { useCallback, useEffect, useState } from "react";

import type { CompanyInfo } from "@/lib/types/dashboard";

/**
 * Helper type for enabled rotation items
 */
type EnabledItem =
  | { type: "company"; companyIndex: number }
  | { type: "performer"; index: number };

/**
 * Builds list of enabled rotation items (companies + performers)
 *
 * Enabled state semantics:
 * - true = explicitly enabled
 * - false = explicitly disabled
 * - undefined = enabled by default
 */
function buildEnabledList(
  performers: string[],
  companies: CompanyInfo[],
  enabledItems: Record<string, boolean>,
): EnabledItem[] {
  const enabledList: EnabledItem[] = [];

  // Add each company if enabled (key = "company:<name>")
  companies.forEach((company, idx) => {
    if (enabledItems[`company:${company.name}`] !== false) {
      enabledList.push({ type: "company", companyIndex: idx });
    }
  });

  // Add performers if enabled
  performers.forEach((name, idx) => {
    if (enabledItems[name] !== false) {
      enabledList.push({ type: "performer", index: idx });
    }
  });

  return enabledList;
}

interface PresentationModeState {
  isActive: boolean;
  isFullscreen: boolean;
  autoRotate: boolean;
  rotationInterval: number; // em segundos
  currentPerformerIndex: number;
  currentCompanyIndex: number | null; // null = showing a performer, number = showing a company
  enabledItems: Record<string, boolean>;
}

/**
 * usePresentationMode - Manage fullscreen presentation mode with auto-rotation
 *
 * Supports multiple companies, each shown as a separate page with its performers.
 */
export function usePresentationMode(
  performers: string[],
  companies: CompanyInfo[] = [],
) {
  const [state, setState] = useState<PresentationModeState>({
    isActive: false,
    isFullscreen: false,
    autoRotate: true,
    rotationInterval: 30,
    currentPerformerIndex: 0,
    currentCompanyIndex: null,
    enabledItems: {},
  });

  // Auto-rotate between companies and performers
  useEffect(() => {
    if (!state.isActive || !state.autoRotate || performers.length === 0) {
      return undefined;
    }

    const interval = setInterval(() => {
      setState((prev) => {
        const enabledList = buildEnabledList(
          performers,
          companies,
          prev.enabledItems,
        );
        if (enabledList.length === 0) return prev;

        // Find current item in enabled list
        let currentIdx = -1;
        if (prev.currentCompanyIndex !== null) {
          currentIdx = enabledList.findIndex(
            (item) =>
              item.type === "company" &&
              item.companyIndex === prev.currentCompanyIndex,
          );
        } else {
          currentIdx = enabledList.findIndex(
            (item) =>
              item.type === "performer" &&
              item.index === prev.currentPerformerIndex,
          );
        }

        // Move to next item
        const nextIdx = (currentIdx + 1) % enabledList.length;
        const nextItem = enabledList[nextIdx]!;

        if (nextItem.type === "company") {
          return {
            ...prev,
            currentCompanyIndex: nextItem.companyIndex,
            currentPerformerIndex: 0,
          };
        }
        return {
          ...prev,
          currentCompanyIndex: null,
          currentPerformerIndex: nextItem.index!,
        };
      });
    }, state.rotationInterval * 1000);

    return () => clearInterval(interval);
  }, [
    state.isActive,
    state.autoRotate,
    state.rotationInterval,
    performers,
    companies,
  ]);

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setState((prev) => ({
        ...prev,
        isFullscreen: !!document.fullscreenElement,
      }));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen not supported or denied
    }
  }, []);

  const startPresentation = useCallback(async () => {
    setState((prev) => {
      const initialEnabled: Record<string, boolean> = {};
      companies.forEach((c) => {
        initialEnabled[`company:${c.name}`] = true;
      });
      performers.forEach((performer) => {
        initialEnabled[performer] = true;
      });

      return {
        ...prev,
        isActive: true,
        enabledItems: initialEnabled,
        currentCompanyIndex: companies.length > 0 ? 0 : null,
        currentPerformerIndex: 0,
      };
    });
    await toggleFullscreen();
  }, [toggleFullscreen, performers, companies]);

  const stopPresentation = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isActive: false,
      currentPerformerIndex: 0,
      currentCompanyIndex: null,
    }));
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  }, []);

  const toggleAutoRotate = useCallback(() => {
    setState((prev) => ({ ...prev, autoRotate: !prev.autoRotate }));
  }, []);

  const setRotationInterval = useCallback((seconds: number) => {
    setState((prev) => ({ ...prev, rotationInterval: seconds }));
  }, []);

  const goToCompany = useCallback((companyIndex: number) => {
    setState((prev) => ({
      ...prev,
      currentCompanyIndex: companyIndex,
      currentPerformerIndex: 0,
    }));
  }, []);

  const goToPerformer = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      currentCompanyIndex: null,
      currentPerformerIndex: index,
    }));
  }, []);

  const toggleItemEnabled = useCallback((itemName: string) => {
    setState((prev) => ({
      ...prev,
      enabledItems: {
        ...prev.enabledItems,
        [itemName]: !prev.enabledItems[itemName],
      },
    }));
  }, []);

  const goToNext = useCallback(() => {
    setState((prev) => {
      const enabledList = buildEnabledList(
        performers,
        companies,
        prev.enabledItems,
      );
      if (enabledList.length === 0) return prev;

      let currentIdx = -1;
      if (prev.currentCompanyIndex !== null) {
        currentIdx = enabledList.findIndex(
          (item) =>
            item.type === "company" &&
            item.companyIndex === prev.currentCompanyIndex,
        );
      } else {
        currentIdx = enabledList.findIndex(
          (item) =>
            item.type === "performer" &&
            item.index === prev.currentPerformerIndex,
        );
      }

      const nextIdx = (currentIdx + 1) % enabledList.length;
      const nextItem = enabledList[nextIdx]!;

      if (nextItem.type === "company") {
        return {
          ...prev,
          currentCompanyIndex: nextItem.companyIndex,
          currentPerformerIndex: 0,
        };
      }
      return {
        ...prev,
        currentCompanyIndex: null,
        currentPerformerIndex: nextItem.index!,
      };
    });
  }, [performers, companies]);

  const currentPerformer = performers[state.currentPerformerIndex] || null;
  const currentCompany =
    state.currentCompanyIndex !== null
      ? (companies[state.currentCompanyIndex] ?? null)
      : null;
  const showingCompany = state.currentCompanyIndex !== null;

  return {
    ...state,
    showingCompany,
    currentPerformer,
    currentCompany,
    companies,
    startPresentation,
    stopPresentation,
    toggleFullscreen,
    toggleAutoRotate,
    setRotationInterval,
    goToCompany,
    goToPerformer,
    goToNext,
    toggleItemEnabled,
  };
}
