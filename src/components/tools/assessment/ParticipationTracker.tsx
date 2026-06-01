import { Download } from "lucide-react";
import { escapeCsv } from "../../../lib/toolLogic";
import type { Student } from "../../../lib/types";
import { useExport } from "../../../providers/ExportProvider";
import { useRoster } from "../../../providers/RosterProvider";
import { useToast } from "../../../hooks/useToast";
import { InputField, Panel, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function ParticipationTracker({ state, setState }: ToolProps) {
  const { roster } = useRoster();
  const { downloadText } = useExport();
  const { notify } = useToast();
  const value = mergeState(state, { eventType: "發言", counts: {} as Record<string, number>, history: [] as string[] });

  function record(student: Student) {
    setState({
      ...value,
      counts: { ...value.counts, [student.id]: (value.counts[student.id] ?? 0) + 1 },
      history: [[new Date().toLocaleTimeString(), student.seatNo, student.name, value.eventType].map(escapeCsv).join(","), ...value.history]
    });
  }

  const sorted = [...roster].sort((a, b) => (value.counts[a.id] ?? 0) - (value.counts[b.id] ?? 0));

  return (
    <div className="tool-grid">
      <Panel title="事件紀錄">
        <InputField label="事件類型" value={value.eventType} onChange={(eventType) => setState({ ...value, eventType })} />
        <div className="student-button-grid">{roster.map((student) => <button key={student.id} onClick={() => record(student)}>{student.seatNo} {student.name}<span>{value.counts[student.id] ?? 0}</span></button>)}</div>
      </Panel>
      <Panel title="參與次數排序（少→多）" action={<button className="ghost-button" onClick={() => { downloadText("participation.csv", ["時間,座號,姓名,事件", ...value.history].join("\n"), "text/csv;charset=utf-8"); notify("已匯出參與紀錄 CSV", "success"); }}><Download size={16} />CSV</button>}>
        <div className="result-list scroll">{sorted.map((student) => <div className={`result-row${(value.counts[student.id] ?? 0) === 0 ? " is-zero" : ""}`} key={student.id}><span>{student.seatNo} {student.name}</span><strong>{value.counts[student.id] ?? 0}</strong></div>)}</div>
      </Panel>
    </div>
  );
}
