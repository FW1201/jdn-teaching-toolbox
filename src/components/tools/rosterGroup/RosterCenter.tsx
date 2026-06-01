import { useState } from "react";
import { Download, Users } from "lucide-react";
import { parseRoster, rosterToCsv, textLines } from "../../../lib/toolLogic";
import { useExport } from "../../../providers/ExportProvider";
import { useRoster } from "../../../providers/RosterProvider";
import { useToast } from "../../../hooks/useToast";
import { Panel, TextAreaField } from "../../shared";

export function RosterCenter() {
  const { roster, setRoster } = useRoster();
  const { downloadText } = useExport();
  const { notify } = useToast();
  const [input, setInput] = useState("1,王小明,男,需要前排\n2,陳小華,女,\n3,林小安,女,可協助同學");

  return (
    <div className="tool-grid">
      <Panel title="匯入名單">
        <TextAreaField label="貼上 CSV 或表格" rows={8} value={input} onChange={setInput} placeholder="座號,姓名,性別,備註" />
        <div className="action-row">
          <button className="primary-button" onClick={() => { const parsed = parseRoster(input); setRoster(parsed); notify(parsed.length ? `已匯入 ${parsed.length} 位學生` : "未解析到有效名單，請檢查格式", parsed.length ? "success" : "error"); }}>
            <Users size={16} />
            匯入 {textLines(input).length} 筆
          </button>
          <button className="secondary-button" onClick={() => downloadText("class-roster.csv", rosterToCsv(roster), "text/csv;charset=utf-8")}>
            <Download size={16} />
            匯出 CSV
          </button>
        </div>
      </Panel>
      <Panel title={`目前名單 ${roster.length} 人`}>
        <div className="table-like">
          <div className="table-head"><span>座號</span><span>姓名</span><span>性別</span><span>備註</span></div>
          {roster.map((student) => (
            <div key={student.id} className="table-row">
              <span>{student.seatNo}</span>
              <span>{student.name}</span>
              <span>{student.gender}</span>
              <span>{student.note}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
