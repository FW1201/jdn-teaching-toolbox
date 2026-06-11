import { Download, Plus, Trash2 } from "lucide-react";
import { escapeCsv, textLines } from "../../../lib/toolLogic";
import { useExport } from "../../../providers/ExportProvider";
import { useToast } from "../../../hooks/useToast";
import { InputField, Panel, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function RubricBoard({ state, setState }: ToolProps) {
  const { downloadText } = useExport();
  const { notify } = useToast();
  const value = mergeState(state, {
    title: "小組發表規準",
    criteria: ["內容清楚", "證據充分", "合作分工"],
    levels: ["待加強", "達成", "精熟"],
    descriptions: {} as Record<string, string>,
    targets: "第一組\n第二組\n第三組\n第四組",
    scores: {} as Record<string, string>
  });
  const targets = textLines(value.targets);
  const csv = ["對象,向度,等第", ...targets.flatMap((target) => value.criteria.map((criterion) => [target, criterion, value.scores[`${target}:${criterion}`] ?? ""].map(escapeCsv).join(",")))].join("\n");

  return (
    <div className="tool-grid">
      <Panel title="規準設定">
        <InputField label="規準名稱" value={value.title} onChange={(title) => setState({ ...value, title })} />
        <label className="field"><span>評量對象（每行一個）</span><textarea rows={4} value={value.targets} onChange={(event) => setState({ ...value, targets: event.target.value })} /></label>
        <div className="list-editor">
          {value.criteria.map((criterion, index) => <div className="list-row compact-row" key={criterion}><input value={criterion} onChange={(event) => setState({ ...value, criteria: value.criteria.map((item, itemIndex) => itemIndex === index ? event.target.value : item) })} /><button className="icon-only" aria-label="刪除指標" onClick={() => setState({ ...value, criteria: value.criteria.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 size={16} /></button></div>)}
        </div>
        <button className="secondary-button" onClick={() => setState({ ...value, criteria: [...value.criteria, `向度 ${value.criteria.length + 1}`] })}><Plus size={16} />新增向度</button>
      </Panel>
      <Panel title="評分表" action={<button className="ghost-button" onClick={() => { downloadText("rubric-board.csv", csv, "text/csv;charset=utf-8"); notify("已匯出規準評量 CSV", "success"); }}><Download size={16} />CSV</button>}>
        <div className="projection-card">
          <h2>{value.title}</h2>
          <div className="rubric-grid" style={{ gridTemplateColumns: `minmax(120px, 1fr) repeat(${value.criteria.length}, minmax(120px, 1fr))` }}>
            <strong>對象</strong>
            {value.criteria.map((criterion) => <strong key={criterion}>{criterion}</strong>)}
            {targets.flatMap((target) => [
              <strong key={`${target}-label`}>{target}</strong>,
              ...value.criteria.map((criterion) => {
                const key = `${target}:${criterion}`;
                return <select key={key} value={value.scores[key] ?? ""} onChange={(event) => setState({ ...value, scores: { ...value.scores, [key]: event.target.value } })}><option value="">未評</option>{value.levels.map((level) => <option key={level}>{level}</option>)}</select>;
              })
            ])}
          </div>
        </div>
      </Panel>
    </div>
  );
}
