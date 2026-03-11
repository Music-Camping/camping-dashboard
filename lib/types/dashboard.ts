export interface MetricEntry {
  value: number;
  datetime: string; // ISO 8601
  performer?: string; // presente apenas em "total"
  extra_data?: Record<string, unknown>;
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

export interface PerformerFiles {
  [key: string]: string; // name -> url mapping
}

export interface PerformerData {
  youtube?: PlatformMetrics;
  instagram?: PlatformMetrics;
  spotify?: PlatformMetrics;
  spotify_playlists?: SpotifyPlaylistData[];
  files?: PerformerFiles;
}

export interface CompanyInfo {
  name: string;
  performers: string[];
}

export interface CompanyData extends PerformerData {
  performers: string[];
  companies?: CompanyInfo[];
}

// Raw API response types (new nested format)
export interface RawPerformerApiData {
  files?: PerformerFiles;
  metrics: Record<string, Record<string, MetricData>>;
}

export interface RawCompanyApiData {
  files?: PerformerFiles;
  metrics: Record<string, Record<string, MetricData>>;
  performers: Record<string, RawPerformerApiData>;
}

export type RawApiResponse = Record<string, RawCompanyApiData>;

export type DashboardResponse = Record<string, PerformerData | CompanyData> & {
  company?: CompanyData;
};

export interface ChartDataPoint {
  date: string; // ISO date string (date part only: "2026-01-30")
  value: number;
  previousValue?: number; // For percentage calculation in tooltip
}

export interface MultiPerformerChartDataPoint {
  date: string; // ISO date string (date part only: "2026-01-30")
  datetime?: string; // ISO datetime for "today" period with hourly granularity
  timestamp: number; // Milliseconds since epoch for reliable sorting
  performers: Record<string, number>; // Map of performer name to metric value
}
