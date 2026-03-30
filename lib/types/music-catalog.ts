export interface MusicTrack {
  id: number;
  name: string;
  status: "pending" | "recording" | "mixing" | "mastering" | "released";
  authorship: "Não Solicitado" | "Solicitado" | "Recebida" | null;
  phonogram_contract:
    | "Não solicitado"
    | "Solicitado"
    | "Contrato enviado"
    | "Contrato Assinado"
    | null;
  deadline: string;
  created_at: string;
  updated_at: string;
}

export type SongStatus = MusicTrack["status"];
export type SongAuthorship = NonNullable<MusicTrack["authorship"]>;
export type SongPhonogramContract = NonNullable<
  MusicTrack["phonogram_contract"]
>;

export const STATUS_LABELS: Record<SongStatus, string> = {
  pending: "Pendente",
  recording: "Gravando",
  mixing: "Mixagem",
  mastering: "Masterização",
  released: "Lançado",
};

export const AUTHORSHIP_LABELS: Record<SongAuthorship, string> = {
  "Não Solicitado": "Não Solicitado",
  Solicitado: "Solicitado",
  Recebida: "Recebida",
};

export const PHONOGRAM_CONTRACT_LABELS: Record<SongPhonogramContract, string> =
  {
    "Não solicitado": "Não solicitado",
    Solicitado: "Solicitado",
    "Contrato enviado": "Contrato enviado",
    "Contrato Assinado": "Contrato Assinado",
  };

export type SensitiveColumn =
  | "name"
  | "status"
  | "authorship"
  | "phonogram_contract"
  | "deadline";

export const SENSITIVE_COLUMNS: SensitiveColumn[] = [
  "name",
  "status",
  "authorship",
  "phonogram_contract",
  "deadline",
];
