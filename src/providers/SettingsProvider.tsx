import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ToolboxSettings } from "../lib/types";

interface SettingsContextValue {
  settings: ToolboxSettings;
  updateSettings: (patch: Partial<ToolboxSettings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ initialSettings, onChange, children }: { initialSettings: ToolboxSettings; onChange: (settings: ToolboxSettings) => void; children: ReactNode }) {
  const [settings, setSettings] = useState(initialSettings);
  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      updateSettings: (patch) => {
        setSettings((current) => {
          const next = { ...current, ...patch };
          onChange(next);
          return next;
        });
      }
    }),
    [onChange, settings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used inside SettingsProvider");
  return context;
}
