import { useState } from "react";
import type { ReactNode } from "react";
import { Download, Save, Trash2, Users } from "lucide-react";
import { toPng } from "html-to-image";
import type { ToolDefinition } from "../data/tools.registry";
import { useExport } from "../providers/ExportProvider";

/** 工具元件統一 props：state 由 toolState[id] 提供，setState 寫回該 id。 */
export interface ToolProps {
  state: unknown;
  setState: (value: unknown) => void;
}

/** 合併預設值與已儲存狀態，缺值時回退到 fallback。 */
export function mergeState<T extends object>(state: unknown, fallback: T): T {
  return { ...fallback, ...(state && typeof state === "object" ? (state as Partial<T>) : {}) };
}

/** 以 html-to-image 將指定 DOM 匯出為 PNG（投影卡、座位表、概念圖共用）。 */
export async function exportElementAsPng(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;
  const url = await toPng(element, { pixelRatio: 2, backgroundColor: "#0b0e11" });
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();
}

export function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function pointOnCircle(index: number, total: number, cx: number, cy: number, radius: number) {
  const angle = (Math.PI * 2 * index) / Math.max(1, total) - Math.PI / 2;
  return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
}

export function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h3>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 5
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

export function InputField({
  label,
  value,
  onChange,
  type = "text",
  min
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  min?: number;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} type={type} min={min} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function RosterGate({ toolName, onOpenRoster }: { toolName: string; onOpenRoster: () => void }) {
  return (
    <section className="roster-gate">
      <Users size={42} />
      <div>
        <p className="eyebrow">Roster required</p>
        <h2>{toolName} 需要先匯入班級名單</h2>
        <p>名單會供抽人、分組、座位表、計分與參與追蹤共用；資料只留在瀏覽器本機。</p>
      </div>
      <button className="primary-button" onClick={onOpenRoster}>
        <Users size={17} />
        前往班級名單中心
      </button>
    </section>
  );
}

export function ExportButton({ filename, data }: { filename: string; data: unknown }) {
  const { downloadJson } = useExport();
  return (
    <button className="secondary-button full-width" onClick={() => downloadJson(filename, data)}>
      <Download size={16} />
      匯出目前工具資料
    </button>
  );
}

export function TemplateManager({ toolId, state, onApply }: { toolId: string; state: unknown; onApply: (state: unknown) => void }) {
  const storageKey = `jdn-toolbox-template:${toolId}`;
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; state: unknown }>>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? "[]") as Array<{ id: string; name: string; state: unknown }>;
    } catch {
      return [];
    }
  });

  function persist(nextTemplates: Array<{ id: string; name: string; state: unknown }>) {
    setTemplates(nextTemplates);
    localStorage.setItem(storageKey, JSON.stringify(nextTemplates));
  }

  function saveTemplate() {
    const name = window.prompt("模板名稱", `模板 ${templates.length + 1}`);
    if (!name) return;
    persist([{ id: crypto.randomUUID(), name, state: state ?? null }, ...templates].slice(0, 8));
  }

  return (
    <div className="template-manager">
      <div className="detail-list">
        <strong>本機模板</strong>
      </div>
      <button className="secondary-button full-width" onClick={saveTemplate}>
        <Save size={16} />
        儲存目前設定
      </button>
      {templates.map((template) => (
        <div className="template-row" key={template.id}>
          <button onClick={() => onApply(template.state)}>{template.name}</button>
          <button className="icon-only" onClick={() => persist(templates.filter((item) => item.id !== template.id))} aria-label="刪除模板">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function GenericTool({ definition, state, setState }: { definition: ToolDefinition; state: unknown; setState: (value: unknown) => void }) {
  const value = mergeState(state, { notes: "", result: "" });
  return (
    <div className="tool-grid">
      <Panel title="教師設定">
        <TextAreaField label="操作內容" value={value.notes} onChange={(notes) => setState({ ...value, notes })} />
      </Panel>
      <Panel title="結果區">
        <div className="projection-card">
          <h2>{definition.name}</h2>
          <p>{value.notes || definition.summary}</p>
        </div>
      </Panel>
    </div>
  );
}
