export interface MetricEntry {
  value: number;
  datetime: string; // ISO 8601
  performer?: string; // presente apenas em "total"
}

export interface MetricData {
  latest: number;
  entries: MetricEntry[];
}

export interface PlatformMetrics {
  followers: MetricData;
  views?: MetricData; // YouTube only
  video_count?: MetricData; // YouTube only
  post_count?: MetricData; // Instagram only
  monthly_listeners?: MetricData; // Spotify only
}

export interface SpotifyPlaylistTrack {
  name: string;
  thumbnail_url?: string;
  play_count: string; // string no payload da API — converter com parseInt() ao exibir
}

export interface SpotifyPlaylistData {
  name: string;
  thumbnail_url?: string;
  followers: MetricData;
  track_count: MetricData;
  tracks: SpotifyPlaylistTrack[];
}

export interface PerformerData {
  youtube?: PlatformMetrics;
  instagram?: PlatformMetrics;
  spotify?: PlatformMetrics;
  spotify_playlists?: SpotifyPlaylistData[];
}

export interface DashboardResponse {
  [performerName: string]: PerformerData;
}

export interface ChartDataPoint {
  date: string; // ISO date string (date part only: "2026-01-30")
  value: number;
  previousValue?: number; // For percentage calculation in tooltip
}

export interface MultiPerformerChartDataPoint {
  date: string; // date only (YYYY-MM-DD)
  datetime?: string; // full datetime with time (ISO format)
  timestamp: number; // milliseconds since epoch, for proportional time spacing in charts
  performers: Record<string, number>; // { "João": 100000, "Maria": 200000 }
}
