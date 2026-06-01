import { Download, RotateCcw, StepForward } from "lucide-react";
import { escapeCsv, textLines } from "../../../lib/toolLogic";
import { useExport } from "../../../providers/ExportProvider";
import { useToast } from "../../../hooks/useToast";
import { InputField, Panel, exportElementAsPng, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function StationRotation({ state, setState }: ToolProps) {
  const { downloadText } = useExport();
  const { notify } = useToast();
  const value = mergeState(state, {
    title: "分站閱讀任務",
    stations: "A站：文本線索\nB站：觀點整理\nC站：小組討論\nD站：出口任務",
    groups: "第一組\n第二組\n第三組\n第四組",
    minutes: 8,
    round: 0,
    materials: "學習單、平板、便利貼"
  });
  const stations = textLines(value.stations);
  const groups = textLines(value.groups);
  const rows = groups.map((group, groupIndex) => {
    const current = stations[(groupIndex + value.round) % Math.max(1, stations.length)] ?? "";
    const next = stations[(groupIndex + value.round + 1) % Math.max(1, stations.length)] ?? "";
    return { group, current, next };
  });
  const csv = ["組別,目前站,下一站", ...rows.map((row) => [row.group, row.current, row.next].map(escapeCsv).join(","))].join("\n");

  return (
    <div className="tool-grid">
      <Panel title="輪站設定">
        <InputField label="活動名稱" value={value.title} onChange={(title) => setState({ ...value, title })} />
        <div className="two-col">
          <label className="field"><span>站名</span><textarea rows={6} value={value.stations} onChange={(event) => setState({ ...value, stations: event.target.value })} /></label>
          <label className="field"><span>組別</span><textarea rows={6} value={value.groups} onChange={(event) => setState({ ...value, groups: event.target.value })} /></label>
        </div>
        <InputField label="每站分鐘" type="number" min={1} value={value.minutes} onChange={(minutes) => setState({ ...value, minutes: Number(minutes) })} />
        <InputField label="材料提醒" value={value.materials} onChange={(materials) => setState({ ...value, materials })} />
        <div className="action-row">
          <button className="primary-button" onClick={() => setState({ ...value, round: value.round + 1 })}><StepForward size={16} />下一輪</button>
          <button className="secondary-button" onClick={() => setState({ ...value, round: 0 })}><RotateCcw size={16} />重設輪次</button>
        </div>
      </Panel>
      <Panel
        title="投影輪站"
        action={
          <>
            <button className="ghost-button" onClick={() => { downloadText("station-rotation.csv", csv, "text/csv;charset=utf-8"); notify("已匯出輪站表 CSV", "success"); }}><Download size={16} />CSV</button>
            <button className="ghost-button" onClick={() => { void exportElementAsPng("station-rotation-export", "station-rotation.png"); notify("已匯出輪站 PNG", "success"); }}><Download size={16} />PNG</button>
          </>
        }
      >
        <div className="projection-card" id="station-rotation-export">
          <p className="eyebrow">{value.title} · 第 {value.round + 1} 輪 · 每站 {value.minutes} 分鐘</p>
          <h2>{rows[0]?.current || "請設定站名"}</h2>
          <p>{value.materials}</p>
          <div className="table-like compact">
            <div className="table-head"><span>組別</span><span>目前站</span><span>下一站</span></div>
            {rows.map((row) => <div className="table-row" key={row.group}><strong>{row.group}</strong><span>{row.current}</span><span>{row.next}</span></div>)}
          </div>
        </div>
      </Panel>
    </div>
  );
}
