export interface Championship {
  id: number;
  title: string;
  starts_at: string;
  ends_at: string;
  hashtag: string;
  contenders: Array<{
    id: number;
    name: string;
    score?: number;
  }>;
}

export type ChampionshipStatus = "active" | "upcoming" | "completed";

export function getChampionshipStatus(
  championship: Championship,
): ChampionshipStatus {
  const now = new Date();
  const startDate = new Date(championship.starts_at);
  const endDate = new Date(championship.ends_at);

  if (now < startDate) {
    return "upcoming";
  }
  if (now > endDate) {
    return "completed";
  }
  return "active";
}
