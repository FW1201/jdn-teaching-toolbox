import { Download, Printer, Shuffle } from "lucide-react";
import { createSeatingCells, escapeCsv, textLines } from "../../../lib/toolLogic";
import type { SeatingCell } from "../../../lib/types";
import { useExport } from "../../../providers/ExportProvider";
import { useRoster } from "../../../providers/RosterProvider";
import { useToast } from "../../../hooks/useToast";
import { InputField, Panel, exportElementAsPng, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function SeatingChart({ state, setState }: ToolProps) {
  const { roster } = useRoster();
  const { downloadText } = useExport();
  const { notify } = useToast();
  const value = mergeState(state, { rows: 5, cols: 6, teacherSide: "上方講台", apart: "", front: "", back: "", cells: [] as SeatingCell[] });
  const cells = value.cells.length ? value.cells : createSeatingCells(value.rows, value.cols, roster, "seatNo");

  function update(next: typeof value) {
    setState(next);
  }

  function arrange(mode: "random" | "seatNo") {
    update({ ...value, cells: createSeatingCells(value.rows, value.cols, roster, mode) });
  }

  const studentMap = new Map(roster.map((student) => [student.id, student]));
  const seatedStudents = cells.flatMap((cell) => {
    const student = cell.studentId ? studentMap.get(cell.studentId) : undefined;
    return student ? [{ cell, student }] : [];
  });
  const apartPairs = textLines(value.apart).map((line) => line.split(/,|，|、|\s+/).map((part) => part.trim()).filter(Boolean)).filter((pair) => pair.length >= 2);
  const conflicts = apartPairs.flatMap(([a, b]) => {
    const first = seatedStudents.find((item) => item.student.name.includes(a) || item.student.seatNo === a);
    const second = seatedStudents.find((item) => item.student.name.includes(b) || item.student.seatNo === b);
    if (!first || !second) return [];
    const adjacent = Math.abs(first.cell.row - second.cell.row) + Math.abs(first.cell.col - second.cell.col) === 1;
    return adjacent ? [`${first.student.name} 與 ${second.student.name} 相鄰，違反需分開限制`] : [];
  });
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
        <label className="field">
          <span>需分開（每行一組，可用逗號）</span>
          <textarea rows={3} value={value.apart} onChange={(event) => update({ ...value, apart: event.target.value })} placeholder="王小明,陳小華" />
        </label>
        <div className="two-col">
          <InputField label="前排偏好" value={value.front} onChange={(front) => update({ ...value, front })} />
          <InputField label="後排偏好" value={value.back} onChange={(back) => update({ ...value, back })} />
        </div>
        <div className="action-row">
          <button className="primary-button" onClick={() => arrange("random")}><Shuffle size={16} />隨機排</button>
          <button className="secondary-button" onClick={() => arrange("seatNo")}>座號排</button>
        </div>
        <div className="result-list">
          {conflicts.length ? conflicts.map((conflict) => <div className="notice-row warning" key={conflict}>{conflict}</div>) : <div className="notice-row success">目前沒有相鄰衝突。</div>}
        </div>
      </Panel>
      <Panel
        title="座位表"
        action={
          <>
            <button className="ghost-button" onClick={() => { downloadText("seating-chart.csv", `列,欄,座號,姓名\n${csv}`, "text/csv;charset=utf-8"); notify("已匯出座位表 CSV", "success"); }}><Download size={16} />CSV</button>
            <button className="ghost-button" onClick={() => { void exportElementAsPng("seating-export", "seating-chart.png"); notify("已匯出座位表 PNG", "success"); }}><Printer size={16} />PNG</button>
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
