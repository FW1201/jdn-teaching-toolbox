import React, { useCallback, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { ExportProvider } from "./providers/ExportProvider";
import { RosterProvider } from "./providers/RosterProvider";
import { SettingsProvider } from "./providers/SettingsProvider";
import { ToastProvider } from "./hooks/useToast";
import { clearState, loadState, saveState } from "./lib/storage";
import type { Student, ToolboxBackup, ToolboxSettings } from "./lib/types";
import "./styles.css";

function Root() {
  const [persisted, setPersisted] = useState(loadState);
  const [resetKey, setResetKey] = useState(0);

  const persistRoster = useCallback((roster: Student[]) => {
    setPersisted((current) => {
      const next = { ...current, roster };
      saveState(next);
      return next;
    });
  }, []);

  const persistSettings = useCallback((settings: ToolboxSettings) => {
    setPersisted((current) => {
      const next = { ...current, settings };
      saveState(next);
      return next;
    });
  }, []);

  const persistToolState = useCallback((toolState: Record<string, unknown>) => {
    setPersisted((current) => {
      const next = { ...current, toolState };
      saveState(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    clearState();
    const next = loadState();
    setPersisted(next);
    setResetKey((value) => value + 1);
  }, []);

  const restoreBackup = useCallback((backup: ToolboxBackup) => {
    const next = {
      roster: Array.isArray(backup.roster) ? backup.roster : [],
      settings: backup.settings,
      toolState: backup.toolState && typeof backup.toolState === "object" ? backup.toolState : {}
    };
    saveState(next);
    setPersisted(next);
    setResetKey((value) => value + 1);
  }, []);

  const providerKey = useMemo(() => `providers-${resetKey}`, [resetKey]);

  return (
    <RosterProvider key={`${providerKey}-roster`} initialRoster={persisted.roster} onChange={persistRoster}>
      <SettingsProvider key={`${providerKey}-settings`} initialSettings={persisted.settings} onChange={persistSettings}>
        <ExportProvider>
          <ToastProvider>
            <App initialToolState={persisted.toolState} onToolStateChange={persistToolState} onResetAll={resetAll} onRestoreBackup={restoreBackup} />
          </ToastProvider>
        </ExportProvider>
      </SettingsProvider>
    </RosterProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
