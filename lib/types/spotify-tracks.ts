export interface SpotifyTrack {
  track_id: string;
  track_name: string;
  play_count: number;
  recorded_at: string; // ISO 8601 timestamp
}

export interface SpotifyTracksResponse {
  [performerName: string]: SpotifyTrack[];
}

export interface SpotifyTopTrack {
  track_id: string;
  track_name: string;
  performer_name: string;
  play_count: number;
  recorded_at: string; // ISO 8601 timestamp
}

export interface SpotifyTopTracksResponse {
  tracks: SpotifyTopTrack[];
}
