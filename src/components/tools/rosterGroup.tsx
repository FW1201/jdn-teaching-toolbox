import { useState } from "react";
import { Download, Printer, Shuffle, Users, Wand2 } from "lucide-react";
import {
  buildGroups,
  createSeatingCells,
  escapeCsv,
  groupsToCsv,
  parseRoster,
  rosterToCsv,
  shuffle,
  textLines
} from "../../lib/toolLogic";
import type { GroupResult, SeatingCell, Student } from "../../lib/types";
import { useExport } from "../../providers/ExportProvider";
import { useRoster } from "../../providers/RosterProvider";
import { useToast } from "../../hooks/useToast";
import { ConfirmButton } from "../ui/ConfirmButton";
import { InputField, Panel, TextAreaField, exportElementAsPng, mergeState } from "../shared";
import type { ToolProps } from "../shared";

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

export function SeatingChart({ state, setState }: ToolProps) {
  const { roster } = useRoster();
  const { downloadText } = useExport();
  const value = mergeState(state, { rows: 5, cols: 6, teacherSide: "上方講台", cells: [] as SeatingCell[] });
  const cells = value.cells.length ? value.cells : createSeatingCells(value.rows, value.cols, roster, "seatNo");

  function update(next: typeof value) {
    setState(next);
  }

  function arrange(mode: "random" | "seatNo") {
    update({ ...value, cells: createSeatingCells(value.rows, value.cols, roster, mode) });
  }

  const studentMap = new Map(roster.map((student) => [student.id, student]));
  const csv = cells.map((cell) => {
    const student = cell.studentId ? studentMap.get(cell.studentId) : undefined;
    return [String(cell.row + 1), String(cell.col + 1), student?.seatNo ?? "", student?.name ?? ""].map(escapeCsv).join(",");
  }).join("\n");

  return (
    <div className="tool-grid">
      <Panel title="座位設定">
        <div className="two-col">
          <InputField label="列" type="number" min={1} value={value.rows} onChange={(rows) => update({ ...value, rows: Number(rows), cells: [] })} />
          <InputField label="欄" type="number" min={1} value={value.cols} onChange={(cols) => update({ ...value, cols: Number(cols), cells: [] })} />
        </div>
        <InputField label="講台標示" value={value.teacherSide} onChange={(teacherSide) => update({ ...value, teacherSide })} />
        <div className="action-row">
          <button className="primary-button" onClick={() => arrange("random")}><Shuffle size={16} />隨機排</button>
          <button className="secondary-button" onClick={() => arrange("seatNo")}>座號排</button>
        </div>
      </Panel>
      <Panel
        title="座位表"
        action={
          <>
            <button className="ghost-button" onClick={() => downloadText("seating-chart.csv", `列,欄,座號,姓名\n${csv}`, "text/csv;charset=utf-8")}><Download size={16} />CSV</button>
            <button className="ghost-button" onClick={() => exportElementAsPng("seating-export", "seating-chart.png")}><Printer size={16} />PNG</button>
          </>
        }
      >
        <div className="seating-board" id="seating-export" style={{ gridTemplateColumns: `repeat(${value.cols}, minmax(88px, 1fr))` }}>
          <div className="teacher-desk" style={{ gridColumn: `1 / span ${value.cols}` }}>{value.teacherSide}</div>
          {cells.map((cell) => {
            const student = cell.studentId ? studentMap.get(cell.studentId) : undefined;
            return (
              <button key={cell.id} className={cell.empty ? "seat empty" : "seat"} onClick={() => update({ ...value, cells: cells.map((entry) => (entry.id === cell.id ? { ...entry, empty: !entry.empty, studentId: entry.empty ? entry.studentId : undefined } : entry)) })}>
                <span>{cell.row + 1}-{cell.col + 1}</span>
                <strong>{student?.name ?? "空位"}</strong>
                <small>{student?.seatNo ?? ""}</small>
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

export function SeatConstraints({ state, setState }: ToolProps) {
  const { roster } = useRoster();
  const value = mergeState(state, { apart: "", front: "", back: "" });
  const apartNames = textLines(value.apart).map((line) => line.split(/,|、|\s+/).filter(Boolean));
  const conflicts = apartNames
    .filter((pair) => pair.length >= 2)
    .map((pair) => `${pair[0]} 與 ${pair[1]} 需分開`)
    .filter((text) => roster.some((student) => text.includes(student.name)));

  return (
    <div className="tool-grid">
      <Panel title="限制條件">
        <TextAreaField label="需分開（每行一組，可用逗號）" value={value.apart} onChange={(apart) => setState({ ...value, apart })} placeholder="王小明,陳小華" />
        <TextAreaField label="前排偏好" value={value.front} onChange={(front) => setState({ ...value, front })} placeholder="需要前排或視力提醒" />
        <TextAreaField label="後排偏好" value={value.back} onChange={(back) => setState({ ...value, back })} placeholder="可坐後排名單" />
      </Panel>
      <Panel title="檢查結果">
        <div className="result-list">
          {conflicts.length ? conflicts.map((conflict) => <div className="notice-row warning" key={conflict}>{conflict}</div>) : <div className="notice-row success">目前限制已記錄，可回到座位表重新排座。</div>}
          <div className="notice-row">前排：{textLines(value.front).join("、") || "未設定"}</div>
          <div className="notice-row">後排：{textLines(value.back).join("、") || "未設定"}</div>
        </div>
      </Panel>
    </div>
  );
}

export function RandomPicker({ state, setState }: ToolProps) {
  const { roster } = useRoster();
  const { downloadText } = useExport();
  const { notify } = useToast();
  const value = mergeState(state, { count: 1, exclude: true, pickedIds: [] as string[], history: [] as string[] });
  const available = roster.filter((student) => !value.exclude || !value.pickedIds.includes(student.id));

  function pick() {
    const selected = shuffle(available).slice(0, Math.max(1, value.count));
    setState({
      ...value,
      pickedIds: [...value.pickedIds, ...selected.map((student) => student.id)],
      history: [`${new Date().toLocaleTimeString()} ${selected.map((student) => student.name).join("、")}`, ...value.history]
    });
  }

  return (
    <div className="tool-grid">
      <Panel title="抽選設定">
        <div className="tool-meta-line">
          <span>全班 <strong>{roster.length}</strong> 人</span>
          <span>已抽 <strong>{value.pickedIds.length}</strong> 人</span>
          <span>剩餘可抽 <strong>{available.length}</strong> 人</span>
        </div>
        <InputField label="抽選人數" type="number" min={1} value={value.count} onChange={(count) => setState({ ...value, count: Number(count) })} />
        <label className="toggle-row"><input type="checkbox" checked={value.exclude} onChange={(event) => setState({ ...value, exclude: event.target.checked })} />排除已抽</label>
        <button className="primary-button" disabled={!available.length} onClick={pick}><Shuffle size={16} />{available.length ? "開始抽選" : "已全部抽完"}</button>
        <ConfirmButton className="secondary-button" onConfirm={() => { setState({ ...value, pickedIds: [], history: [] }); notify("已重設抽選紀錄"); }}>重設紀錄</ConfirmButton>
      </Panel>
      <Panel title="抽選結果" action={<button className="ghost-button" onClick={() => { downloadText("random-picker.txt", value.history.join("\n")); notify("已匯出抽選紀錄", "success"); }}><Download size={16} />匯出</button>}>
        <div className="winner-display">{value.history[0] ?? "尚未抽選"}</div>
        <div className="result-list">{value.history.map((row) => <div key={row} className="result-row"><span>{row}</span></div>)}</div>
      </Panel>
    </div>
  );
}

export function WheelTool({ state, setState }: ToolProps) {
  const { roster } = useRoster();
  const value = mergeState(state, { source: "名單", itemsText: "朗讀第一段\n回答問題\n擔任記錄", remove: true, selected: "", rotation: 0 });
  const sourceItems = value.source === "名單" && roster.length ? roster.map((student) => student.name) : textLines(value.itemsText);
  const items = sourceItems.filter(Boolean);

  function spin() {
    if (!items.length) return;
    const selected = items[Math.floor(Math.random() * items.length)];
    const nextItems = value.remove ? items.filter((item) => item !== selected).join("\n") : value.itemsText;
    setState({ ...value, selected, rotation: value.rotation + 720 + Math.floor(Math.random() * 360), itemsText: value.source === "名單" ? value.itemsText : nextItems });
  }

  return (
    <div className="tool-grid">
      <Panel title="轉盤項目">
        <label className="field"><span>來源</span><select value={value.source} onChange={(event) => setState({ ...value, source: event.target.value })}><option>名單</option><option>自訂</option></select></label>
        <TextAreaField label="自訂項目" rows={8} value={value.itemsText} onChange={(itemsText) => setState({ ...value, itemsText })} />
        <label className="toggle-row"><input type="checkbox" checked={value.remove} onChange={(event) => setState({ ...value, remove: event.target.checked })} />抽出後移除</label>
      </Panel>
      <Panel title="投影轉盤">
        <div className="wheel" style={{ transform: `rotate(${value.rotation}deg)` }}>{items.slice(0, 12).map((item) => <span key={item}>{item}</span>)}</div>
        <button className="primary-button" onClick={spin}><Wand2 size={16} />旋轉</button>
        <div className="winner-display">{value.selected || "等待旋轉"}</div>
      </Panel>
    </div>
  );
}

export function GroupMaker({ state, setState }: ToolProps) {
  const { roster } = useRoster();
  const { downloadText } = useExport();
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
        <button className="secondary-button" onClick={() => downloadText("groups.csv", groupsToCsv(groups), "text/csv;charset=utf-8")}><Download size={16} />匯出 CSV</button>
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

export function RoleAssigner({ state, setState }: ToolProps) {
  const { roster } = useRoster();
  const { downloadText } = useExport();
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
      <Panel title="角色表" action={<button className="ghost-button" onClick={() => downloadText("roles.csv", csv, "text/csv;charset=utf-8")}><Download size={16} />CSV</button>}>
        <div className="table-like compact">
          <div className="table-head"><span>組別</span><span>學生</span><span>角色</span></div>
          {value.assignments.map((item, index) => <div className="table-row" key={`${item.student}-${index}`}><span>{item.group}</span><span>{item.student}</span><strong>{item.role}</strong></div>)}
        </div>
      </Panel>
    </div>
  );
}
