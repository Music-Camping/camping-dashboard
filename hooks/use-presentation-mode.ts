"use client";

import { useCallback, useEffect, useState } from "react";

interface PresentationModeState {
  isActive: boolean;
  isFullscreen: boolean;
  autoRotate: boolean;
  rotationInterval: number; // em segundos
  currentPerformerIndex: number;
}

export function usePresentationMode(performers: string[]) {
  const [state, setState] = useState<PresentationModeState>({
    isActive: false,
    isFullscreen: false,
    autoRotate: true,
    rotationInterval: 30, // 30 segundos por performer
    currentPerformerIndex: 0,
  });

  // Auto-rotate entre performers
  useEffect(() => {
    if (!state.isActive || !state.autoRotate || performers.length === 0) {
      return undefined;
    }

    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        currentPerformerIndex:
          (prev.currentPerformerIndex + 1) % performers.length,
      }));
    }, state.rotationInterval * 1000);

    return () => clearInterval(interval);
  }, [
    state.isActive,
    state.autoRotate,
    state.rotationInterval,
    performers.length,
  ]);

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
    setState((prev) => ({ ...prev, isActive: true }));
    await toggleFullscreen();
  }, [toggleFullscreen]);

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

  const goToPerformer = useCallback((index: number) => {
    setState((prev) => ({ ...prev, currentPerformerIndex: index }));
  }, []);

  const currentPerformer = performers[state.currentPerformerIndex] || null;

  return {
    ...state,
    currentPerformer,
    startPresentation,
    stopPresentation,
    toggleFullscreen,
    toggleAutoRotate,
    setRotationInterval,
    goToPerformer,
  };
}
