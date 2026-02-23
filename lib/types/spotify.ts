import type { MetricData } from "./dashboard";

export interface SpotifyRanking {
  position: number;
  previousPosition: number;
  trackId: string;
  trackName: string;
  artistName: string;
  thumbnail: string;
  streams: number;
  change: "up" | "down" | "same" | "new";
}

export interface SpotifyTrackItem {
  id: string;
  name: string;
  performer: string;
  thumbnail: string;
  plays: number;
}

export interface PerformerRanking {
  performer: string;
  rankings: SpotifyRanking[];
}

export interface SpotifyMetrics {
  monthlyListeners: MetricData;
  rankings: SpotifyRanking[];
  rankingsByPerformer: PerformerRanking[];
  allTracks: SpotifyTrackItem[];
}
