import { Download, Printer, Shuffle } from "lucide-react";
import { createSeatingCells, escapeCsv } from "../../../lib/toolLogic";
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
