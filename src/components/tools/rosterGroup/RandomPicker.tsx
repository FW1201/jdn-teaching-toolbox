import { Download, Shuffle } from "lucide-react";
import { shuffle } from "../../../lib/toolLogic";
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
