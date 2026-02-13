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

export interface PerformerData {
  youtube?: PlatformMetrics;
  instagram?: PlatformMetrics;
  spotify?: PlatformMetrics;
}

export interface DashboardResponse {
  [performerName: string]: PerformerData;
}

export interface ChartDataPoint {
  date: string; // ISO date string (date part only: "2026-01-30")
  value: number;
  previousValue?: number; // For percentage calculation in tooltip
}
