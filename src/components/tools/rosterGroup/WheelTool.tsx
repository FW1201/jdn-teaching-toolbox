import { Wand2 } from "lucide-react";
import { shuffle, textLines } from "../../../lib/toolLogic";
import { useRoster } from "../../../providers/RosterProvider";
import { Panel, TextAreaField, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

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
