import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useExport } from "../../../providers/ExportProvider";
import { useToast } from "../../../hooks/useToast";
import { Panel, formatSeconds, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function StopwatchTool({ state, setState }: ToolProps) {
  const value = mergeState(state, { elapsed: 0, running: false, laps: [] as Array<{ id: string; label: string; time: number }> });
  const [tick, setTick] = useState(0);
  const { downloadText } = useExport();
  const { notify } = useToast();

  useEffect(() => {
    if (!value.running) return undefined;
    const id = window.setInterval(() => {
      setState({ ...value, elapsed: value.elapsed + 1 });
      setTick((current) => current + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [setState, tick, value]);

  const time = formatSeconds(value.elapsed);
  const output = value.laps.map((lap, index) => `${index + 1}. ${lap.label}: ${formatSeconds(lap.time)}`).join("\n");

  return (
    <div className="tool-grid">
      <Panel title="正向計時">
        <div className="stopwatch-display">{time}</div>
        <div className="action-row">
          <button className="primary-button" onClick={() => setState({ ...value, running: !value.running })}>{value.running ? "暫停" : "開始"}</button>
          <button className="secondary-button" onClick={() => setState({ ...value, elapsed: 0, running: false, laps: [] })}>重設</button>
          <button className="secondary-button" onClick={() => setState({ ...value, laps: [...value.laps, { id: crypto.randomUUID(), label: `分段 ${value.laps.length + 1}`, time: value.elapsed }] })}>分段</button>
        </div>
      </Panel>
      <Panel
        title="分段紀錄"
        action={<button className="ghost-button" onClick={() => { downloadText("stopwatch-laps.txt", output); notify("已匯出分段紀錄", "success"); }}><Download size={16} />匯出</button>}
      >
        <div className="result-list">
          {value.laps.map((lap, index) => (
            <div key={lap.id} className="result-row">
              <span>{index + 1}</span>
              <input value={lap.label} onChange={(event) => setState({ ...value, laps: value.laps.map((entry) => (entry.id === lap.id ? { ...entry, label: event.target.value } : entry)) })} />
              <strong>{formatSeconds(lap.time)}</strong>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
