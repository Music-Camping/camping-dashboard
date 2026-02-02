export type PeriodFilter = "today" | "7d" | "30d";

export type SelectedPerformers = string[];

export interface FilterState {
  period: PeriodFilter;
  selectedPerformers: SelectedPerformers;
}

export interface FilterContextValue {
  filters: FilterState;
  setPeriod: (period: PeriodFilter) => void;
  setSelectedPerformers: (performers: SelectedPerformers) => void;
  togglePerformer: (performer: string) => void;
  availablePerformers: string[];
  setAvailablePerformers: (performers: string[]) => void;
}

export const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
];
