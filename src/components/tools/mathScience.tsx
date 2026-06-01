import type { CSSProperties } from "react";
import { textLines } from "../../lib/toolLogic";
import { InputField, Panel, TextAreaField, mergeState } from "../shared";
import type { ToolProps } from "../shared";

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

export function FractionTiles({ state, setState }: ToolProps) {
  const value = mergeState(state, { numerator: 3, denominator: 8, mode: "長條" });
  const pieces = Array.from({ length: Math.max(1, value.denominator) }, (_, index) => index < value.numerator);
  const decimal = value.denominator ? value.numerator / value.denominator : 0;
  const percent = Math.round(decimal * 1000) / 10;

  return (
    <div className="tool-grid">
      <Panel title="分數設定">
        <div className="two-col">
          <InputField label="分子" type="number" min={0} value={value.numerator} onChange={(numerator) => setState({ ...value, numerator: Number(numerator) })} />
          <InputField label="分母" type="number" min={1} value={value.denominator} onChange={(denominator) => setState({ ...value, denominator: Number(denominator) })} />
        </div>
        <label className="field"><span>模型</span><select value={value.mode} onChange={(event) => setState({ ...value, mode: event.target.value })}><option>長條</option><option>圓形</option></select></label>
      </Panel>
      <Panel title="分數模型">
        <div className={value.mode === "圓形" ? "fraction-pie" : "fraction-bar"} style={{ "--segments": value.denominator, "--filled": value.numerator } as CSSProperties}>
          {value.mode === "長條" && pieces.map((filled, index) => <span key={index} className={filled ? "filled" : ""} />)}
        </div>
        <div className="fraction-label">{value.numerator} / {value.denominator}</div>
        <div className="tool-meta-line" style={{ justifyContent: "center" }}><span>≈ <strong>{decimal.toFixed(3).replace(/\.?0+$/, "")}</strong></span><span><strong>{percent}%</strong></span></div>
      </Panel>
    </div>
  );
}

export function UnitFormula({ state, setState }: ToolProps) {
  const value = mergeState(state, { amount: 1, from: "m", to: "cm", formulas: "速度 = 距離 ÷ 時間\n面積 = 長 × 寬\n密度 = 質量 ÷ 體積" });
  // 以「類別」分組，避免長度↔質量等跨類別的無意義換算
  const units: Record<string, { factor: number; group: string }> = {
    mm: { factor: 0.001, group: "長度" }, cm: { factor: 0.01, group: "長度" }, m: { factor: 1, group: "長度" }, km: { factor: 1000, group: "長度" },
    mg: { factor: 0.000001, group: "質量" }, g: { factor: 0.001, group: "質量" }, kg: { factor: 1, group: "質量" }, t: { factor: 1000, group: "質量" },
    ml: { factor: 0.001, group: "容量" }, l: { factor: 1, group: "容量" },
    s: { factor: 1, group: "時間" }, min: { factor: 60, group: "時間" }, hr: { factor: 3600, group: "時間" }
  };
  const from = units[value.from.trim()];
  const to = units[value.to.trim()];
  const supported = from && to && from.group === to.group;
  const result = supported ? (value.amount * from.factor) / to.factor : NaN;
  const formatted = !supported
    ? "未支援此換算（請使用同類別單位）"
    : Math.abs(result) !== 0 && (Math.abs(result) >= 1e6 || Math.abs(result) < 1e-4)
      ? `${result.toExponential(3)} ${value.to}`
      : `${result.toLocaleString()} ${value.to}`;

  return (
    <div className="tool-grid">
      <Panel title="單位換算">
        <InputField label="數值" type="number" value={value.amount} onChange={(amount) => setState({ ...value, amount: Number(amount) })} />
        <div className="two-col">
          <InputField label="從" value={value.from} onChange={(from) => setState({ ...value, from: from })} />
          <InputField label="到" value={value.to} onChange={(to) => setState({ ...value, to: to })} />
        </div>
        <p className="shortcut-hint">支援：長度 mm/cm/m/km · 質量 mg/g/kg/t · 容量 ml/l · 時間 s/min/hr</p>
        <div className="winner-display">{formatted}</div>
      </Panel>
      <Panel title="公式卡">
        <TextAreaField label="每行一張公式卡" value={value.formulas} onChange={(formulas) => setState({ ...value, formulas })} />
        <div className="formula-cards">{textLines(value.formulas).map((formula) => <strong key={formula}>{formula}</strong>)}</div>
      </Panel>
    </div>
  );
}
