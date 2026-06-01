import { Download, Shuffle, Wand2 } from "lucide-react";
import { escapeCsv, shuffle, textLines } from "../../../lib/toolLogic";
import { useExport } from "../../../providers/ExportProvider";
import { useRoster } from "../../../providers/RosterProvider";
import { useToast } from "../../../hooks/useToast";
import { ConfirmButton } from "../../ui/ConfirmButton";
import { InputField, Panel, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function RandomPicker({ state, setState }: ToolProps) {
  const { roster } = useRoster();
  const { downloadText } = useExport();
  const { notify } = useToast();
  const value = mergeState(state, { mode: "students" as "students" | "tasks", count: 1, exclude: true, pickedIds: [] as string[], removedItems: [] as string[], itemsText: "朗讀第一段\n回答問題\n擔任記錄", selected: "", rotation: 0, history: [] as string[] });
  const taskItems = textLines(value.itemsText).filter((item) => !value.exclude || !value.removedItems.includes(item));
  const available = roster.filter((student) => !value.exclude || !value.pickedIds.includes(student.id));
  const csv = ["時間,模式,結果", ...value.history.map((row) => row.split("｜").map(escapeCsv).join(","))].join("\n");

  function pick() {
    if (value.mode === "tasks") {
      const selected = shuffle(taskItems)[0];
      if (!selected) return;
      setState({
        ...value,
        selected,
        rotation: value.rotation + 720 + Math.floor(Math.random() * 360),
        removedItems: value.exclude ? [...value.removedItems, selected] : value.removedItems,
        history: [`${new Date().toLocaleTimeString()}｜任務｜${selected}`, ...value.history]
      });
      return;
    }

    const selected = shuffle(available).slice(0, Math.max(1, value.count));
    setState({
      ...value,
      selected: selected.map((student) => student.name).join("、"),
      pickedIds: [...value.pickedIds, ...selected.map((student) => student.id)],
      history: [`${new Date().toLocaleTimeString()}｜學生｜${selected.map((student) => `${student.seatNo} ${student.name}`).join("、")}`, ...value.history]
    });
  }

  const canPick = value.mode === "tasks" ? taskItems.length > 0 : available.length > 0;

  return (
    <div className="tool-grid">
      <Panel title="抽選設定">
        <div className="tool-meta-line">
          <span>全班 <strong>{roster.length}</strong> 人</span>
          <span>已抽 <strong>{value.pickedIds.length}</strong> 人</span>
          <span>任務 <strong>{taskItems.length}</strong> 項</span>
        </div>
        <div className="quick-buttons">
          <button className={value.mode === "students" ? "active" : ""} onClick={() => setState({ ...value, mode: "students" })}>抽學生</button>
          <button className={value.mode === "tasks" ? "active" : ""} onClick={() => setState({ ...value, mode: "tasks" })}>任務轉盤</button>
        </div>
        {value.mode === "students" ? (
          <InputField label="抽選人數" type="number" min={1} value={value.count} onChange={(count) => setState({ ...value, count: Number(count) })} />
        ) : (
          <label className="field">
            <span>轉盤項目</span>
            <textarea rows={7} value={value.itemsText} onChange={(event) => setState({ ...value, itemsText: event.target.value, removedItems: [] })} />
          </label>
        )}
        <label className="toggle-row"><input type="checkbox" checked={value.exclude} onChange={(event) => setState({ ...value, exclude: event.target.checked })} />排除已抽</label>
        <button className="primary-button" disabled={!canPick} onClick={pick}>{value.mode === "tasks" ? <Wand2 size={16} /> : <Shuffle size={16} />}{canPick ? "開始抽選" : "已全部抽完"}</button>
        <ConfirmButton className="secondary-button" onConfirm={() => { setState({ ...value, pickedIds: [], removedItems: [], selected: "", history: [] }); notify("已重設抽選紀錄"); }}>重設紀錄</ConfirmButton>
      </Panel>
      <Panel title={value.mode === "tasks" ? "投影轉盤" : "抽選結果"} action={<button className="ghost-button" onClick={() => { downloadText("picker-center.csv", csv, "text/csv;charset=utf-8"); notify("已匯出抽選紀錄 CSV", "success"); }}><Download size={16} />CSV</button>}>
        {value.mode === "tasks" && <div className="wheel" style={{ transform: `rotate(${value.rotation}deg)` }}>{taskItems.slice(0, 12).map((item) => <span key={item}>{item}</span>)}</div>}
        <div className="winner-display">{value.selected || "尚未抽選"}</div>
        <div className="result-list">{value.history.map((row) => <div key={row} className="result-row"><span>{row}</span></div>)}</div>
      </Panel>
    </div>
  );
}
