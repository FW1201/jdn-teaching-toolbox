import { Download, Plus } from "lucide-react";
import { escapeCsv } from "../../../lib/toolLogic";
import type { Student } from "../../../lib/types";
import { useExport } from "../../../providers/ExportProvider";
import { useRoster } from "../../../providers/RosterProvider";
import { useToast } from "../../../hooks/useToast";
import { InputField, Panel, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

const discussionTypes = ["發言", "證據", "追問", "回應", "補充"];

export function DiscussionTracker({ state, setState }: ToolProps) {
  const { roster } = useRoster();
  const { downloadText } = useExport();
  const { notify } = useToast();
  const value = mergeState(state, { type: "發言", rule: "先引用文本證據，再提出想法。", records: [] as Array<{ id: string; time: string; studentId: string; studentName: string; type: string; note: string }> });

  function record(student: Student) {
    setState({
      ...value,
      records: [{ id: crypto.randomUUID(), time: new Date().toLocaleTimeString(), studentId: student.id, studentName: student.name, type: value.type, note: "" }, ...value.records]
    });
  }

  const counts = discussionTypes.map((type) => ({ type, count: value.records.filter((record) => record.type === type).length }));
  const csv = ["時間,學生,類型,備註", ...value.records.map((record) => [record.time, record.studentName, record.type, record.note].map(escapeCsv).join(","))].join("\n");

  return (
    <div className="tool-grid">
      <Panel title="討論紀錄">
        <label className="field"><span>事件類型</span><select value={value.type} onChange={(event) => setState({ ...value, type: event.target.value })}>{discussionTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
        <InputField label="投影提醒" value={value.rule} onChange={(rule) => setState({ ...value, rule })} />
        <div className="student-button-grid">
          {roster.map((student) => <button key={student.id} onClick={() => record(student)}>{student.seatNo} {student.name}<span><Plus size={18} /></span></button>)}
        </div>
      </Panel>
      <Panel title="匿名投影統計" action={<button className="ghost-button" onClick={() => { downloadText("discussion-tracker.csv", csv, "text/csv;charset=utf-8"); notify("已匯出討論紀錄 CSV", "success"); }}><Download size={16} />CSV</button>}>
        <div className="projection-card">
          <p className="eyebrow">討論規則</p>
          <h2>{value.rule}</h2>
          <div className="stat-cards">
            {counts.map((item) => <div key={item.type}><strong>{item.count}</strong><span>{item.type}</span></div>)}
          </div>
        </div>
      </Panel>
    </div>
  );
}
