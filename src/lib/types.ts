export interface Student {
  id: string;
  seatNo: string;
  name: string;
  gender?: string;
  note?: string;
}

export interface ToolboxSettings {
  className: string;
  fontScale: number;
  projectionMode: boolean;
  reduceMotion: boolean;
  favoriteToolIds: string[];
  recentToolIds: string[];
}

export interface ToolboxBackup {
  version: 1;
  exportedAt: string;
  roster: Student[];
  settings: ToolboxSettings;
  toolState: Record<string, unknown>;
}

export interface SeatingCell {
  id: string;
  row: number;
  col: number;
  studentId?: string;
  empty?: boolean;
}

export interface GroupResult {
  id: string;
  name: string;
  students: Student[];
}

export interface SavedTemplate {
  id: string;
  name: string;
  data: unknown;
  updatedAt: string;
}
