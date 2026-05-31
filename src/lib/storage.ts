import type { Student, ToolboxBackup, ToolboxSettings } from "./types";

const STORAGE_KEY = "jdn-teaching-toolbox:v1";

interface PersistedState {
  roster: Student[];
  settings: ToolboxSettings;
  toolState: Record<string, unknown>;
}

export const defaultSettings: ToolboxSettings = {
  className: "我的班級",
  fontScale: 1,
  projectionMode: false,
  reduceMotion: true,
  favoriteToolIds: [],
  recentToolIds: []
};

const defaultState: PersistedState = {
  roster: [],
  settings: defaultSettings,
  toolState: {}
};

export function loadState(): PersistedState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      roster: Array.isArray(parsed.roster) ? parsed.roster : [],
      settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
      toolState: parsed.toolState && typeof parsed.toolState === "object" ? parsed.toolState : {}
    };
  } catch {
    return defaultState;
  }
}

export function saveState(state: PersistedState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function createBackup(roster: Student[], settings: ToolboxSettings, toolState: Record<string, unknown>): ToolboxBackup {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    roster,
    settings,
    toolState
  };
}

export function downloadFile(filename: string, content: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
