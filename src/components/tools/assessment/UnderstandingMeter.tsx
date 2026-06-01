import { Download } from "lucide-react";
import { escapeCsv } from "../../../lib/toolLogic";
import { useExport } from "../../../providers/ExportProvider";
import { useToast } from "../../../hooks/useToast";
import { ConfirmButton } from "../../ui/ConfirmButton";
import { Panel, TextAreaField, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function UnderstandingMeter({ state, setState }: ToolProps) {
  const { downloadText } = useExport();
  const { notify } = useToast();
  const value = mergeState(state, { counts: [0, 0, 0, 0, 0], labels: ["完全不懂", "有點模糊", "大致理解", "可以練習", "能教別人"], note: "" });
  const total = value.counts.reduce((sum, count) => sum + count, 0);
  const csv = ["分數,標籤,人數", ...value.labels.map((label, index) => [String(index + 1), label, String(value.counts[index])].map(escapeCsv).join(","))].join("\n");

  return (
    <div className="tool-grid">
      <Panel title="快速點選">
        <div className="tool-meta-line"><span>目前累積 <strong>{total}</strong> 人次回應</span></div>
        <TextAreaField label="備註" rows={3} value={value.note} onChange={(note) => setState({ ...value, note })} />
        <ConfirmButton className="secondary-button" onConfirm={() => { setState({ ...value, counts: [0, 0, 0, 0, 0] }); notify("已清空理解統計"); }}>清空統計</ConfirmButton>
      </Panel>
      <Panel title={`全班理解狀態 · ${total} 人次`} action={<button className="ghost-button" onClick={() => { downloadText("understanding-meter.csv", csv, "text/csv;charset=utf-8"); notify("已匯出理解統計 CSV", "success"); }}><Download size={16} />CSV</button>}>
        <div className="meter-grid">
          {value.labels.map((label, index) => (
            <button key={label} className="meter-card" onClick={() => setState({ ...value, counts: value.counts.map((count, countIndex) => (countIndex === index ? count + 1 : count)) })}>
              <strong>{index + 1}</strong>
              <span>{label}</span>
              <em>{value.counts[index]}</em>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}
