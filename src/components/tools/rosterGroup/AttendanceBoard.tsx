import { Download } from "lucide-react";
import { escapeCsv } from "../../../lib/toolLogic";
import { useExport } from "../../../providers/ExportProvider";
import { useRoster } from "../../../providers/RosterProvider";
import { useToast } from "../../../hooks/useToast";
import { InputField, Panel, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

const attendanceStatuses = ["出席", "遲到", "請假", "缺席"] as const;

export function AttendanceBoard({ state, setState }: ToolProps) {
  const { roster } = useRoster();
  const { downloadText } = useExport();
  const { notify } = useToast();
  const value = mergeState(state, { date: new Date().toISOString().slice(0, 10), statusById: {} as Record<string, string>, notesById: {} as Record<string, string> });

  function setStatus(studentId: string, status: string) {
    setState({ ...value, statusById: { ...value.statusById, [studentId]: status } });
  }

  const counts = attendanceStatuses.map((status) => ({
    status,
    count: roster.filter((student) => (value.statusById[student.id] ?? "出席") === status).length
  }));
  const csv = ["日期,座號,姓名,狀態,備註", ...roster.map((student) => [value.date, student.seatNo, student.name, value.statusById[student.id] ?? "出席", value.notesById[student.id] ?? ""].map(escapeCsv).join(","))].join("\n");

  return (
    <div className="tool-grid">
      <Panel title="點名表">
        <InputField label="日期" type="date" value={value.date} onChange={(date) => setState({ ...value, date })} />
        <div className="student-button-grid">
          {roster.map((student) => (
            <button key={student.id} onClick={() => {
              const currentIndex = attendanceStatuses.indexOf((value.statusById[student.id] ?? "出席") as typeof attendanceStatuses[number]);
              setStatus(student.id, attendanceStatuses[(currentIndex + 1) % attendanceStatuses.length]);
            }}>
              {student.seatNo} {student.name}
              <span>{value.statusById[student.id] ?? "出席"}</span>
            </button>
          ))}
        </div>
      </Panel>
      <Panel title="投影統計" action={<button className="ghost-button" onClick={() => { downloadText("attendance-board.csv", csv, "text/csv;charset=utf-8"); notify("已匯出點名 CSV", "success"); }}><Download size={16} />CSV</button>}>
        <div className="projection-card">
          <p className="eyebrow">{value.date}</p>
          <h2>點名統計</h2>
          <div className="stat-cards">
            {counts.map((item) => <div key={item.status}><strong>{item.count}</strong><span>{item.status}</span></div>)}
          </div>
          <p>投影模式不顯示個別備註。</p>
        </div>
      </Panel>
    </div>
  );
}
