import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { downloadFile } from "../lib/storage";

interface ExportContextValue {
  downloadText: (filename: string, text: string, type?: string) => void;
  downloadJson: (filename: string, value: unknown) => void;
}

const ExportContext = createContext<ExportContextValue | undefined>(undefined);

export function ExportProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ExportContextValue>(
    () => ({
      downloadText: downloadFile,
      downloadJson: (filename, value) => downloadFile(filename, JSON.stringify(value, null, 2), "application/json;charset=utf-8")
    }),
    []
  );

  return <ExportContext.Provider value={value}>{children}</ExportContext.Provider>;
}

export function useExport() {
  const context = useContext(ExportContext);
  if (!context) throw new Error("useExport must be used inside ExportProvider");
  return context;
}
