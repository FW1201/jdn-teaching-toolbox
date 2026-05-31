import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Student } from "../lib/types";

interface RosterContextValue {
  roster: Student[];
  setRoster: (students: Student[]) => void;
}

const RosterContext = createContext<RosterContextValue | undefined>(undefined);

export function RosterProvider({ initialRoster, onChange, children }: { initialRoster: Student[]; onChange: (students: Student[]) => void; children: ReactNode }) {
  const [roster, setRosterState] = useState(initialRoster);
  const value = useMemo<RosterContextValue>(
    () => ({
      roster,
      setRoster: (students) => {
        setRosterState(students);
        onChange(students);
      }
    }),
    [onChange, roster]
  );

  return <RosterContext.Provider value={value}>{children}</RosterContext.Provider>;
}

export function useRoster() {
  const context = useContext(RosterContext);
  if (!context) throw new Error("useRoster must be used inside RosterProvider");
  return context;
}
