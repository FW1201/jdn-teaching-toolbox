import type { CSSProperties } from "react";
import { textLines } from "../../../lib/toolLogic";
import { InputField, Panel, TextAreaField, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function NumberCoordinate({ state, setState }: ToolProps) {
  const value = mergeState(state, { mode: "數線", min: -10, max: 10, points: "A, -3\nB, 4\nC, 7" });
  const points = textLines(value.points).map((line) => line.split(/,|，/).map((part) => part.trim()));
  const range = Math.max(1, value.max - value.min);

  return (
    <div className="tool-grid">
      <Panel title="座標設定">
        <label className="field"><span>模式</span><select value={value.mode} onChange={(event) => setState({ ...value, mode: event.target.value })}><option>數線</option><option>座標</option></select></label>
        <div className="two-col">
          <InputField label="最小值" type="number" value={value.min} onChange={(min) => setState({ ...value, min: Number(min) })} />
          <InputField label="最大值" type="number" value={value.max} onChange={(max) => setState({ ...value, max: Number(max) })} />
        </div>
        <TextAreaField label={value.mode === "數線" ? "點名,值" : "點名,x,y"} value={value.points} onChange={(pointsText) => setState({ ...value, points: pointsText })} />
      </Panel>
      <Panel title={value.mode}>
        {value.mode === "數線" ? (
          <div className="number-line">
            <div className="axis" />
            {points.map(([label, raw]) => {
              const pct = ((Number(raw) - value.min) / range) * 100;
              return <div key={label} className="line-point" style={{ left: `${pct}%` }}><span>{label}</span><strong>{raw}</strong></div>;
            })}
            <span className="axis-min">{value.min}</span><span className="axis-max">{value.max}</span>
          </div>
        ) : (
          <svg className="coordinate-board" viewBox="0 0 500 500">
            <g className="grid">
              {Array.from({ length: 13 }, (_, i) => 30 + i * 36.6).map((pos) => (
                <g key={`grid-${pos}`}>
                  <line x1={pos} y1="30" x2={pos} y2="470" />
                  <line x1="30" y1={pos} x2="470" y2={pos} />
                </g>
              ))}
            </g>
            <line className="axis-line" x1="250" y1="30" x2="250" y2="470" /><line className="axis-line" x1="30" y1="250" x2="470" y2="250" />
            {points.map(([label, x, y]) => <g key={label}><circle cx={250 + Number(x) * 18} cy={250 - Number(y) * 18} r="8" /><text x={260 + Number(x) * 18} y={245 - Number(y) * 18}>{label}({x},{y})</text></g>)}
          </svg>
        )}
      </Panel>
    </div>
  );
}
