import { Download, Shuffle } from "lucide-react";
import { buildGroups, escapeCsv, textLines } from "../../../lib/toolLogic";
import { useExport } from "../../../providers/ExportProvider";
import { useRoster } from "../../../providers/RosterProvider";
import { useToast } from "../../../hooks/useToast";
import { InputField, Panel, TextAreaField, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function RoleAssigner({ state, setState }: ToolProps) {
  const { roster } = useRoster();
  const { downloadText } = useExport();
  const { notify } = useToast();
  const value = mergeState(state, { roles: "主持\n記錄\n報告\n時間管理", groupCount: 4, assignments: [] as Array<{ group: string; student: string; role: string }> });
  const roles = textLines(value.roles);

  function assign() {
    const groups = buildGroups(roster, value.groupCount, false);
    const assignments = groups.flatMap((group) => group.students.map((student, index) => ({ group: group.name, student: student.name, role: roles[index % Math.max(1, roles.length)] ?? "成員" })));
    setState({ ...value, assignments });
  }

  const csv = ["組別,學生,角色", ...value.assignments.map((item) => [item.group, item.student, item.role].map(escapeCsv).join(","))].join("\n");

  return (
    <div className="tool-grid">
      <Panel title="角色庫">
        <TextAreaField label="每行一個角色" value={value.roles} onChange={(rolesText) => setState({ ...value, roles: rolesText })} />
        <InputField label="組數" type="number" min={1} value={value.groupCount} onChange={(groupCount) => setState({ ...value, groupCount: Number(groupCount) })} />
        <button className="primary-button" onClick={assign}><Shuffle size={16} />分配角色</button>
      </Panel>
      <Panel title="角色表" action={<button className="ghost-button" onClick={() => { downloadText("roles.csv", csv, "text/csv;charset=utf-8"); notify("已匯出角色表 CSV", "success"); }}><Download size={16} />CSV</button>}>
        <div className="table-like compact">
          <div className="table-head"><span>組別</span><span>學生</span><span>角色</span></div>
          {value.assignments.map((item, index) => <div className="table-row" key={`${item.student}-${index}`}><span>{item.group}</span><span>{item.student}</span><strong>{item.role}</strong></div>)}
        </div>
      </Panel>
    </div>
  );
}
