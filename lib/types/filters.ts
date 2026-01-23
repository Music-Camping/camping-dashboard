export type PeriodFilter = "today" | "7d" | "30d";

export interface Profile {
  id: string;
  name: string;
}

export interface FilterState {
  period: PeriodFilter;
  profileId: string | null;
}

export interface FilterContextValue {
  filters: FilterState;
  setPeriod: (period: PeriodFilter) => void;
  setProfileId: (profileId: string | null) => void;
}

export const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
];

export const MOCK_PROFILES: Profile[] = [
  { id: "1", name: "Perfil Principal" },
  { id: "2", name: "Perfil Secundário" },
  { id: "3", name: "Perfil Marketing" },
];
