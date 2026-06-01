import { Download, Plus, Save, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useExport } from "../../../providers/ExportProvider";
import { useToast } from "../../../hooks/useToast";
import { InputField, Panel, exportElementAsPng, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function FlowBoard({ state, setState }: ToolProps) {
  const { downloadJson } = useExport();
  const { notify } = useToast();
  const value = mergeState(state, {
    title: "今日國語課",
    items: [
      { id: "1", label: "暖身回顧", minutes: 5, materials: "投影片", done: false },
      { id: "2", label: "小組討論", minutes: 15, materials: "學習單", done: false },
      { id: "3", label: "全班整理", minutes: 10, materials: "白板", done: false }
    ]
  });

  function update(next: typeof value) {
    setState(next);
  }

  function move(index: number, direction: -1 | 1) {
    const items = [...value.items];
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    update({ ...value, items });
  }

  const total = value.items.reduce((sum, item) => sum + Number(item.minutes || 0), 0);
  const current = value.items.find((item) => !item.done) ?? value.items[value.items.length - 1];

  return (
    <div className="tool-grid">
      <Panel
        title="設定流程"
        action={
          <button className="ghost-button" onClick={() => { downloadJson("flow-board-template.json", value); notify("已儲存流程模板", "success"); }}>
            <Save size={16} />
            儲存模板
          </button>
        }
      >
        <InputField label="課堂標題" value={value.title} onChange={(title) => update({ ...value, title })} />
        <div className="list-editor">
          {value.items.map((item, index) => (
            <div className="list-row" key={item.id}>
              <input value={item.label} onChange={(event) => update({ ...value, items: value.items.map((entry) => (entry.id === item.id ? { ...entry, label: event.target.value } : entry)) })} />
              <input className="short-input" type="number" min={1} value={item.minutes} onChange={(event) => update({ ...value, items: value.items.map((entry) => (entry.id === item.id ? { ...entry, minutes: Number(event.target.value) } : entry)) })} />
              <input value={item.materials} onChange={(event) => update({ ...value, items: value.items.map((entry) => (entry.id === item.id ? { ...entry, materials: event.target.value } : entry)) })} />
              <button className="icon-only" disabled={index === 0} onClick={() => move(index, -1)} aria-label="上移"><ArrowUp size={16} /></button>
              <button className="icon-only" disabled={index === value.items.length - 1} onClick={() => move(index, 1)} aria-label="下移"><ArrowDown size={16} /></button>
              <button className="icon-only" onClick={() => update({ ...value, items: value.items.filter((entry) => entry.id !== item.id) })} aria-label="刪除步驟"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <button className="secondary-button" onClick={() => update({ ...value, items: [...value.items, { id: crypto.randomUUID(), label: "新步驟", minutes: 5, materials: "", done: false }] })}>
          <Plus size={16} />
          新增步驟
        </button>
      </Panel>
      <Panel title="投影流程">
        <div className="projection-card" id="flow-board-export">
          <p className="eyebrow">{value.title} · 共 {total} 分鐘</p>
          <h2>{current?.label ?? "流程完成"}</h2>
          <div className="flow-list">
            {value.items.map((item, index) => (
              <button key={item.id} className={item.done ? "flow-item done" : "flow-item"} onClick={() => update({ ...value, items: value.items.map((entry) => (entry.id === item.id ? { ...entry, done: !entry.done } : entry)) })}>
                <span>{index + 1}</span>
                <strong>{item.label}</strong>
                <small>{item.minutes} 分 · {item.materials || "無材料"}</small>
              </button>
            ))}
          </div>
        </div>
        <button className="secondary-button" onClick={() => { void exportElementAsPng("flow-board-export", "flow-board.png"); notify("已匯出流程 PNG", "success"); }}>
          <Download size={16} />
          匯出 PNG
        </button>
      </Panel>
    </div>
  );
}
