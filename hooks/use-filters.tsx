"use client";

import * as React from "react";

import type {
  FilterContextValue,
  FilterState,
  PeriodFilter,
  SelectedPerformers,
} from "@/lib/types/filters";

const FilterContext = React.createContext<FilterContextValue | null>(null);

/**
 * FilterProvider - Manages global filter state (period + selected performers)
 *
 * Wraps application with context providing:
 * - Period filter: "today" | "7d" | "30d"
 * - Selected performers: string[]
 * - Callbacks to update filters
 *
 * @param {React.ReactNode} children - Child components
 *
 * @example
 * <FilterProvider>
 *   <Dashboard />
 * </FilterProvider>
 */
export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = React.useState<FilterState>({
    period: "7d",
    selectedPerformers: [],
  });

  const [availablePerformers, setAvailablePerformersState] = React.useState<
    string[]
  >([]);

  const setPeriod = React.useCallback((period: PeriodFilter) => {
    setFilters((prev) => ({ ...prev, period }));
  }, []);

  const setSelectedPerformers = React.useCallback(
    (performers: SelectedPerformers) => {
      setFilters((prev) => ({ ...prev, selectedPerformers: performers }));
    },
    [],
  );

  const togglePerformer = React.useCallback((performer: string) => {
    setFilters((prev) => {
      const current = prev.selectedPerformers;
      const isSelected = current.includes(performer);
      const newSelected = isSelected
        ? current.filter((p) => p !== performer)
        : [...current, performer];
      return { ...prev, selectedPerformers: newSelected };
    });
  }, []);

  const setAvailablePerformers = React.useCallback((performers: string[]) => {
    setAvailablePerformersState((prev) => {
      // Only update if the array actually changed
      if (
        prev.length === performers.length &&
        prev.every((p, i) => p === performers[i])
      ) {
        return prev;
      }
      return performers;
    });
  }, []);

  const value = React.useMemo<FilterContextValue>(
    () => ({
      filters,
      setPeriod,
      setSelectedPerformers,
      togglePerformer,
      availablePerformers,
      setAvailablePerformers,
    }),
    [
      filters,
      setPeriod,
      setSelectedPerformers,
      togglePerformer,
      availablePerformers,
      setAvailablePerformers,
    ],
  );

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

/**
 * useFilters - Hook to access global filter context
 *
 * Returns filter state and callbacks:
 * - filters.period: Current time period ("today" | "7d" | "30d")
 * - filters.selectedPerformers: Currently selected artist names
 * - setPeriod(): Update period filter
 * - setSelectedPerformers(): Set all selected performers
 * - togglePerformer(): Toggle single performer selection
 * - availablePerformers: All available performers from data
 * - setAvailablePerformers(): Update available list
 *
 * @returns {FilterContextValue} Filter state and callbacks
 * @throws {Error} If used outside of FilterProvider
 *
 * @example
 * function MyComponent() {
 *   const { filters, setPeriod, togglePerformer } = useFilters();
 *   return (
 *     <button onClick={() => setPeriod("30d")}>Last 30 days</button>
 *   );
 * }
 */
export function useFilters() {
  const context = React.useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
