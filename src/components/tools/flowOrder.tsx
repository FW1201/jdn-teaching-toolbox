import { useEffect, useState } from "react";
import type { ComponentType, CSSProperties } from "react";
import { Bell, CircleDot, Download, Layers, Moon, Move, Play, Plus, RotateCcw, Save, Trash2, Users } from "lucide-react";
import { useExport } from "../../providers/ExportProvider";
import { InputField, Panel, TextAreaField, exportElementAsPng, formatSeconds, mergeState } from "../shared";
import type { ToolProps } from "../shared";

export function FlowBoard({ state, setState }: ToolProps) {
  const { downloadJson } = useExport();
  const value = mergeState(state, {
    title: "今日國語課",
    items: [
      { id: "1", label: "暖身回顧", minutes: 5, materials: "投影片", done: false },
      { id: "2", label: "小組討論", minutes: 15, materials: "學習單", done: false },
      { id: "3", label: "全班整理", minutes: 10, materials: "白板", done: false }
    ]
  });

  function update(next: typeof value) {
    setState(next);
  }

  function move(index: number, direction: -1 | 1) {
    const items = [...value.items];
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    update({ ...value, items });
  }

  const total = value.items.reduce((sum, item) => sum + Number(item.minutes || 0), 0);
  const current = value.items.find((item) => !item.done) ?? value.items[value.items.length - 1];

  return (
    <div className="tool-grid">
      <Panel
        title="設定流程"
        action={
          <button className="ghost-button" onClick={() => downloadJson("flow-board-template.json", value)}>
            <Save size={16} />
            儲存模板
          </button>
        }
      >
        <InputField label="課堂標題" value={value.title} onChange={(title) => update({ ...value, title })} />
        <div className="list-editor">
          {value.items.map((item, index) => (
            <div className="list-row" key={item.id}>
              <input value={item.label} onChange={(event) => update({ ...value, items: value.items.map((entry) => (entry.id === item.id ? { ...entry, label: event.target.value } : entry)) })} />
              <input className="short-input" type="number" min={1} value={item.minutes} onChange={(event) => update({ ...value, items: value.items.map((entry) => (entry.id === item.id ? { ...entry, minutes: Number(event.target.value) } : entry)) })} />
              <input value={item.materials} onChange={(event) => update({ ...value, items: value.items.map((entry) => (entry.id === item.id ? { ...entry, materials: event.target.value } : entry)) })} />
              <button className="icon-only" onClick={() => move(index, -1)}><Move size={16} /></button>
              <button className="icon-only" onClick={() => update({ ...value, items: value.items.filter((entry) => entry.id !== item.id) })}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <button className="secondary-button" onClick={() => update({ ...value, items: [...value.items, { id: crypto.randomUUID(), label: "新步驟", minutes: 5, materials: "", done: false }] })}>
          <Plus size={16} />
          新增步驟
        </button>
      </Panel>
      <Panel title="投影流程">
        <div className="projection-card" id="flow-board-export">
          <p className="eyebrow">{value.title} · 共 {total} 分鐘</p>
          <h2>{current?.label ?? "流程完成"}</h2>
          <div className="flow-list">
            {value.items.map((item, index) => (
              <button key={item.id} className={item.done ? "flow-item done" : "flow-item"} onClick={() => update({ ...value, items: value.items.map((entry) => (entry.id === item.id ? { ...entry, done: !entry.done } : entry)) })}>
                <span>{index + 1}</span>
                <strong>{item.label}</strong>
                <small>{item.minutes} 分 · {item.materials || "無材料"}</small>
              </button>
            ))}
          </div>
        </div>
        <button className="secondary-button" onClick={() => exportElementAsPng("flow-board-export", "flow-board.png")}>
          <Download size={16} />
          匯出 PNG
        </button>
      </Panel>
    </div>
  );
}

export function Countdown({ state, setState, visual }: ToolProps & { visual: boolean }) {
  const value = mergeState(state, { minutes: visual ? 8 : 5, secondsLeft: (visual ? 8 : 5) * 60, running: false, message: visual ? "輪站活動" : "時間到", silent: true });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!value.running || value.secondsLeft <= 0) return undefined;
    const id = window.setInterval(() => {
      setState({ ...value, secondsLeft: Math.max(0, value.secondsLeft - 1), running: value.secondsLeft - 1 > 0 });
      setTick((current) => current + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [setState, tick, value]);

  const total = Math.max(1, value.minutes * 60);
  const progress = Math.max(0, Math.min(100, (value.secondsLeft / total) * 100));
  const mm = String(Math.floor(value.secondsLeft / 60)).padStart(2, "0");
  const ss = String(value.secondsLeft % 60).padStart(2, "0");

  function reset(minutes = value.minutes) {
    setState({ ...value, minutes, secondsLeft: minutes * 60, running: false });
  }

  return (
    <div className="tool-grid">
      <Panel title="計時設定">
        <div className="quick-buttons">
          {[1, 3, 5, 10, 15].map((minute) => (
            <button key={minute} className={value.minutes === minute ? "active" : ""} onClick={() => reset(minute)}>
              {minute} 分
            </button>
          ))}
        </div>
        <InputField label="自訂分鐘" type="number" min={1} value={value.minutes} onChange={(minutes) => reset(Number(minutes || 1))} />
        <InputField label="提示文字" value={value.message} onChange={(message) => setState({ ...value, message })} />
        <label className="toggle-row">
          <input type="checkbox" checked={value.silent} onChange={(event) => setState({ ...value, silent: event.target.checked })} />
          無聲模式
        </label>
      </Panel>
      <Panel title={visual ? "視覺計時" : "倒數投影"}>
        <div className={visual ? "timer-display visual" : "timer-display"}>
          {visual ? (
            <div className="timer-ring" style={{ "--progress": `${progress}%` } as CSSProperties}>
              <span>{mm}:{ss}</span>
            </div>
          ) : (
            <strong>{mm}:{ss}</strong>
          )}
          <p>{value.secondsLeft === 0 ? value.message : "剩餘時間"}</p>
          <div className="progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="action-row">
          <button className="primary-button" onClick={() => setState({ ...value, running: !value.running })}>
            <Play size={16} />
            {value.running ? "暫停" : "開始"}
          </button>
          <button className="secondary-button" onClick={() => reset()}>
            <RotateCcw size={16} />
            重設
          </button>
          {!value.silent && value.secondsLeft === 0 && <Bell size={22} className="bell" />}
        </div>
      </Panel>
    </div>
  );
}

export function StopwatchTool({ state, setState }: ToolProps) {
  const value = mergeState(state, { elapsed: 0, running: false, laps: [] as Array<{ id: string; label: string; time: number }> });
  const [tick, setTick] = useState(0);
  const { downloadText } = useExport();

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
        action={<button className="ghost-button" onClick={() => downloadText("stopwatch-laps.txt", output)}><Download size={16} />匯出</button>}
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
