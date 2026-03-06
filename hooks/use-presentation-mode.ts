"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Helper type for enabled items list
 */
type EnabledItem = { type: "company" | "performer"; index?: number };

/**
 * Builds list of enabled rotation items (company + performers)
 *
 * IMPORTANT: Enabled state semantics:
 * - true = explicitly enabled
 * - false = explicitly disabled
 * - undefined = enabled by default (default-enabled pattern)
 *
 * This allows new performers/items to be automatically included in rotation
 * without requiring explicit enabledItems[newItem] = true initialization.
 *
 * @param performers - List of performer names
 * @param enabledItems - Record of item names to enabled state (undefined = enabled)
 * @returns Array of enabled items in rotation order (company first, then performers)
 */
function buildEnabledList(
  performers: string[],
  enabledItems: Record<string, boolean>,
): EnabledItem[] {
  const enabledList: EnabledItem[] = [];

  // Add company if enabled (undefined/true = enabled)
  if (enabledItems.company !== false) {
    enabledList.push({ type: "company" });
  }

  // Add performers if enabled (undefined/true = enabled)
  performers.forEach((_, idx) => {
    if (enabledItems[performers[idx]] !== false) {
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
  showingCompany: boolean;
  enabledItems: Record<string, boolean>; // company + performers that are in rotation
}

/**
 * usePresentationMode - Manage fullscreen presentation mode with auto-rotation
 *
 * Features:
 * - Toggle fullscreen mode (F11)
 * - Auto-rotate between performers (30s intervals)
 * - Manual performer selection
 * - Pause/resume rotation
 * - Exit via ESC key
 *
 * @param {string[]} performers - List of performer names to rotate through
 *
 * @returns {Object} Presentation state and controls
 * - isActive: Whether presentation mode is running
 * - isFullscreen: Whether in fullscreen
 * - currentPerformer: Current performer name
 * - startPresentation(): Enter presentation mode
 * - stopPresentation(): Exit presentation mode
 * - toggleAutoRotate(): Pause/resume auto-rotation
 * - setCurrentPerformer(index): Select specific performer
 * - setRotationInterval(seconds): Change rotation speed
 *
 * @example
 * function Dashboard({ performers }) {
 *   const presentation = usePresentationMode(performers);
 *
 *   return (
 *     <>
 *       <button onClick={presentation.startPresentation}>
 *         Start Presentation
 *       </button>
 *       {presentation.isActive && (
 *         <div>Now showing: {presentation.currentPerformer}</div>
 *       )}
 *     </>
 *   );
 * }
 */
export function usePresentationMode(performers: string[]) {
  const [state, setState] = useState<PresentationModeState>({
    isActive: false,
    isFullscreen: false,
    autoRotate: true,
    rotationInterval: 30, // 30 segundos por performer
    currentPerformerIndex: 0,
    showingCompany: false,
    enabledItems: {},
  });

  // Auto-rotate entre company e performers (apenas os enabled)
  useEffect(() => {
    if (!state.isActive || !state.autoRotate || performers.length === 0) {
      return undefined;
    }

    const interval = setInterval(() => {
      setState((prev) => {
        const enabledList = buildEnabledList(performers, prev.enabledItems);

        // If no items enabled, don't rotate
        if (enabledList.length === 0) {
          return prev;
        }

        // Find current item in enabled list
        let currentIdx = -1;
        if (prev.showingCompany) {
          currentIdx = enabledList.findIndex((item) => item.type === "company");
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
            showingCompany: true,
            currentPerformerIndex: 0,
          };
        } else {
          return {
            ...prev,
            showingCompany: false,
            currentPerformerIndex: nextItem.index!,
          };
        }
      });
    }, state.rotationInterval * 1000);

    return () => clearInterval(interval);
  }, [state.isActive, state.autoRotate, state.rotationInterval, performers]);

  // Monitora mudanças no fullscreen
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
      // Initialize enabledItems: company + all performers enabled
      const initialEnabled: Record<string, boolean> = { company: true };
      performers.forEach((performer) => {
        initialEnabled[performer] = true;
      });

      return {
        ...prev,
        isActive: true,
        enabledItems: initialEnabled,
        showingCompany: true, // Start with company
      };
    });
    await toggleFullscreen();
  }, [toggleFullscreen, performers]);

  const stopPresentation = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isActive: false,
      currentPerformerIndex: 0,
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

  const goToCompany = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showingCompany: true,
      currentPerformerIndex: 0,
    }));
  }, []);

  const goToPerformer = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      showingCompany: false,
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
      const enabledList = buildEnabledList(performers, prev.enabledItems);

      // If no items enabled, don't go to next
      if (enabledList.length === 0) {
        return prev;
      }

      // Find current item in enabled list
      let currentIdx = -1;
      if (prev.showingCompany) {
        currentIdx = enabledList.findIndex((item) => item.type === "company");
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
          showingCompany: true,
          currentPerformerIndex: 0,
        };
      } else {
        return {
          ...prev,
          showingCompany: false,
          currentPerformerIndex: nextItem.index!,
        };
      }
    });
  }, [performers]);

  const currentPerformer = performers[state.currentPerformerIndex] || null;

  return {
    ...state,
    currentPerformer,
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
