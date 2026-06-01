import { InputField, Panel, TextAreaField, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";
import { textLines } from "../../../lib/toolLogic";

export function UnitFormula({ state, setState }: ToolProps) {
  const value = mergeState(state, { amount: 1, from: "m", to: "cm", formulas: "速度 = 距離 ÷ 時間\n面積 = 長 × 寬\n密度 = 質量 ÷ 體積" });
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
