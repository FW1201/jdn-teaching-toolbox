import { Download, Shuffle } from "lucide-react";
import { buildGroups, groupsToCsv } from "../../../lib/toolLogic";
import type { GroupResult } from "../../../lib/types";
import { useExport } from "../../../providers/ExportProvider";
import { useRoster } from "../../../providers/RosterProvider";
import { useToast } from "../../../hooks/useToast";
import { InputField, Panel, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function GroupMaker({ state, setState }: ToolProps) {
  const { roster } = useRoster();
  const { downloadText } = useExport();
  const { notify } = useToast();
  const value = mergeState(state, { groupCount: 4, balanceGender: true, groups: [] as GroupResult[] });
  const groups = value.groups.length ? value.groups : buildGroups(roster, value.groupCount, value.balanceGender);

  function generate() {
    setState({ ...value, groups: buildGroups(roster, value.groupCount, value.balanceGender) });
  }

  return (
    <div className="tool-grid">
      <Panel title="分組設定">
        <InputField label="組數" type="number" min={1} value={value.groupCount} onChange={(groupCount) => setState({ ...value, groupCount: Number(groupCount), groups: [] })} />
        <label className="toggle-row"><input type="checkbox" checked={value.balanceGender} onChange={(event) => setState({ ...value, balanceGender: event.target.checked, groups: [] })} />嘗試性別平衡</label>
        <button className="primary-button" onClick={generate}><Shuffle size={16} />產生分組</button>
        <button className="secondary-button" onClick={() => { downloadText("groups.csv", groupsToCsv(groups), "text/csv;charset=utf-8"); notify("已匯出分組 CSV", "success"); }}><Download size={16} />匯出 CSV</button>
      </Panel>
      <Panel title="分組表">
        <div className="group-grid">
          {groups.map((group) => (
            <div key={group.id} className="group-card">
              <h4>{group.name}</h4>
              {group.students.map((student) => <span key={student.id}>{student.seatNo} {student.name}</span>)}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
