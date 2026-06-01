import type { ComponentType } from "react";
import { Bell, CircleDot, Layers, Moon, Users } from "lucide-react";
import { Panel, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function WorkSymbols({ state, setState }: ToolProps) {
  const value = mergeState(state, {
    active: "silent",
    modes: [
      { id: "silent", label: "安靜獨立", hint: "自己完成，不交談", symbol: "Moon" },
      { id: "pair", label: "兩人討論", hint: "與隔壁同學交換想法", symbol: "Users" },
      { id: "group", label: "小組合作", hint: "分工並完成共同任務", symbol: "Layers" },
      { id: "teacher", label: "可問老師", hint: "先問組員，再問老師", symbol: "Bell" }
    ]
  });
  const iconMap: Record<string, ComponentType<{ size?: number }>> = { Moon, Users, Layers, Bell };

  return (
    <div className="tool-grid">
      <Panel title="模式設定">
        <div className="list-editor">
          {value.modes.map((mode) => (
            <div className="list-row" key={mode.id}>
              <input value={mode.label} onChange={(event) => setState({ ...value, modes: value.modes.map((entry) => (entry.id === mode.id ? { ...entry, label: event.target.value } : entry)) })} />
              <input value={mode.hint} onChange={(event) => setState({ ...value, modes: value.modes.map((entry) => (entry.id === mode.id ? { ...entry, hint: event.target.value } : entry)) })} />
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="投影符號">
        <div className="symbol-grid">
          {value.modes.map((mode) => {
            const Icon = iconMap[mode.symbol] ?? CircleDot;
            return (
              <button key={mode.id} className={value.active === mode.id ? "symbol-card active" : "symbol-card"} onClick={() => setState({ ...value, active: mode.id })}>
                <Icon size={48} />
                <strong>{mode.label}</strong>
                <span>{mode.hint}</span>
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
