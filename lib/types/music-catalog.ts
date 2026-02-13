export interface MusicTrack {
  id: number;
  name: string;
  status: "pending" | "recording" | "mixing" | "mastering" | "released";
  type: "single" | "album_track" | "feat";
  deadline: string;
  created_at: string;
  updated_at: string;
}

export type SongStatus = MusicTrack["status"];
export type SongType = MusicTrack["type"];

export const STATUS_LABELS: Record<SongStatus, string> = {
  pending: "Pendente",
  recording: "Gravando",
  mixing: "Mixagem",
  mastering: "Masterização",
  released: "Lançado",
};

export const TYPE_LABELS: Record<SongType, string> = {
  single: "Single",
  album_track: "Álbum",
  feat: "Feat",
};

export type SensitiveColumn = "name" | "status" | "type" | "deadline";

export const SENSITIVE_COLUMNS: SensitiveColumn[] = [
  "name",
  "status",
  "type",
  "deadline",
];
