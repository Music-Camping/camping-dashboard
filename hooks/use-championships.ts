"use client";

import type { Championship } from "@/lib/types/championships";

// Mock data for now - TODO: connect to real API when backend is fixed
const mockChampionships: Championship[] = [
  {
    id: 1,
    title: "Batalha de Clipes Verão 2026",
    starts_at: "2026-01-30T19:55:05.011602Z",
    ends_at: "2026-03-01T19:55:05.011602Z",
    hashtag: "#ClipVerao2026",
    contenders: [],
  },
  {
    id: 2,
    title: "Desafio Funk Brasil",
    starts_at: "2026-02-04T19:55:05.011602Z",
    ends_at: "2026-03-06T19:55:05.011602Z",
    hashtag: "#FunkBrasil",
    contenders: [],
  },
  {
    id: 3,
    title: "Copa dos MCs",
    starts_at: "2026-02-24T19:55:05.011602Z",
    ends_at: "2026-03-26T19:55:05.011602Z",
    hashtag: "#CopaMCs",
    contenders: [],
  },
  {
    id: 4,
    title: "Trap Masters 2026",
    starts_at: "2026-03-11T19:55:05.011602Z",
    ends_at: "2026-04-10T19:55:05.011602Z",
    hashtag: "#TrapMasters26",
    contenders: [],
  },
  {
    id: 5,
    title: "Festival Rima Pesada",
    starts_at: "2026-01-10T19:55:05.011602Z",
    ends_at: "2026-02-08T19:55:05.011602Z",
    hashtag: "#RimaPesada",
    contenders: [],
  },
];

export function useChampionships() {
  return {
    championships: mockChampionships,
    isLoading: false,
    isError: null,
  };
}
