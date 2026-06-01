import type { CSSProperties } from "react";
import { InputField, Panel, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

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
