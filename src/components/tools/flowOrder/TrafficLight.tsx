import { InputField, Panel, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function TrafficLight({ state, setState }: ToolProps) {
  const value = mergeState(state, {
    active: "green",
    rules: {
      green: "可以小聲討論，完成後舉手。",
      yellow: "降低音量，回到座位完成任務。",
      red: "停止說話，看向教師。"
    }
  });
  const colors = [
    { id: "green", label: "綠燈", className: "green" },
    { id: "yellow", label: "黃燈", className: "yellow" },
    { id: "red", label: "紅燈", className: "red" }
  ];

  return (
    <div className="tool-grid">
      <Panel title="規則文字">
        {colors.map((color) => (
          <InputField key={color.id} label={color.label} value={value.rules[color.id as keyof typeof value.rules]} onChange={(text) => setState({ ...value, rules: { ...value.rules, [color.id]: text } })} />
        ))}
      </Panel>
      <Panel title="投影狀態">
        <div className="traffic-display">
          {colors.map((color) => (
            <button key={color.id} className={`traffic-dot ${color.className} ${value.active === color.id ? "active" : ""}`} onClick={() => setState({ ...value, active: color.id })}>
              {color.label}
            </button>
          ))}
        </div>
        <div className={`status-banner ${value.active}`}>
          <strong>{colors.find((color) => color.id === value.active)?.label}</strong>
          <p>{value.rules[value.active as keyof typeof value.rules]}</p>
        </div>
      </Panel>
    </div>
  );
}
