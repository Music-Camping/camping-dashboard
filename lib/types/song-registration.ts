export interface SongRegistration {
  id: number;
  name: string;
  status: string;
  type: string | null;
  deadline: string | null; // ISO 8601 timestamp
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

export interface CreateSongRegistrationInput {
  name: string;
  status: string;
  type?: string;
  deadline?: string; // ISO 8601 timestamp
}

export interface CreateSongRegistrationResponse extends SongRegistration {}

export type IndexSongRegistrationResponse = SongRegistration[];
