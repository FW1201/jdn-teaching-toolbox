/**
 * 橫條統計列（Binance 深度圖語感）：值/最大值比例條 + 等寬數字。
 * tone：primary（黃，領先/預設強調）、green（高參與/正向）、danger（低參與/警示）、neutral。
 * label / showValue 可省略 → 純軌道模式，可嵌入既有列佈局。
 */
export function StatBar({
  label,
  value,
  max,
  detail,
  tone = "neutral",
  showValue = true
}: {
  label?: string;
  value: number;
  max: number;
  detail?: string;
  tone?: "primary" | "green" | "danger" | "neutral";
  showValue?: boolean;
}) {
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  return (
    <div className={`stat-bar tone-${tone}`}>
      {label !== undefined && <span className="stat-bar-label">{label}</span>}
      <div className="stat-bar-track">
        <span className="stat-bar-fill" style={{ width: `${(ratio * 100).toFixed(1)}%` }} />
      </div>
      {showValue && <em className="stat-bar-value">{detail ?? value}</em>}
    </div>
  );
}
