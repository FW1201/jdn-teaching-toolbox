import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Bell, Download, Play, RotateCcw } from "lucide-react";
import { useToast } from "../../../hooks/useToast";
import { useExport } from "../../../providers/ExportProvider";
import { InputField, Panel, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function Countdown({ state, setState, visual }: ToolProps & { visual: boolean }) {
  const defaultMode = visual ? "visual" : "countdown";
  const value = mergeState(state, { mode: defaultMode as "countdown" | "visual", minutes: visual ? 8 : 5, secondsLeft: (visual ? 8 : 5) * 60, running: false, message: visual ? "輪站活動" : "時間到", silent: true, visualStyle: "ring" as "ring" | "bar" });
  const [tick, setTick] = useState(0);
  const { notify } = useToast();
  const { downloadJson } = useExport();
  const prevSeconds = useRef(value.secondsLeft);

  useEffect(() => {
    if (!value.running || value.secondsLeft <= 0) return undefined;
    const id = window.setInterval(() => {
      setState({ ...value, secondsLeft: Math.max(0, value.secondsLeft - 1), running: value.secondsLeft - 1 > 0 });
      setTick((current) => current + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [setState, tick, value]);

  useEffect(() => {
    if (prevSeconds.current > 0 && value.secondsLeft === 0) {
      notify(value.message || "時間到！", "info");
    }
    prevSeconds.current = value.secondsLeft;
  }, [value.secondsLeft, value.message, notify]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.code === "Space") {
        event.preventDefault();
        setState({ ...value, running: !value.running });
      } else if (event.key === "r" || event.key === "R") {
        setState({ ...value, secondsLeft: value.minutes * 60, running: false });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setState, value]);

  const total = Math.max(1, value.minutes * 60);
  const progress = Math.max(0, Math.min(100, (value.secondsLeft / total) * 100));
  const mm = String(Math.floor(value.secondsLeft / 60)).padStart(2, "0");
  const ss = String(value.secondsLeft % 60).padStart(2, "0");
  const warning = value.running && value.secondsLeft > 0 && value.secondsLeft <= 10;
  const isVisual = value.mode === "visual";

  function reset(minutes = value.minutes) {
    setState({ ...value, minutes, secondsLeft: minutes * 60, running: false });
  }

  return (
    <div className="tool-grid">
      <Panel
        title="計時設定"
        action={<button className="ghost-button" onClick={() => { downloadJson("time-workbench-template.json", value); notify("已匯出計時工作台模板", "success"); }}><Download size={16} />JSON</button>}
      >
        <div className="quick-buttons">
          <button className={value.mode === "countdown" ? "active" : ""} onClick={() => setState({ ...value, mode: "countdown" })}>倒數</button>
          <button className={value.mode === "visual" ? "active" : ""} onClick={() => setState({ ...value, mode: "visual" })}>視覺計時</button>
        </div>
        <div className="quick-buttons">
          {[1, 3, 5, 10, 15].map((minute) => (
            <button key={minute} className={value.minutes === minute ? "active" : ""} onClick={() => reset(minute)}>
              {minute} 分
            </button>
          ))}
        </div>
        <InputField label="自訂分鐘" type="number" min={1} value={value.minutes} onChange={(minutes) => reset(Number(minutes || 1))} />
        <InputField label="提示文字" value={value.message} onChange={(message) => setState({ ...value, message })} />
        {isVisual && (
          <label className="field">
            <span>視覺樣式</span>
            <select value={value.visualStyle} onChange={(event) => setState({ ...value, visualStyle: event.target.value as typeof value.visualStyle })}>
              <option value="ring">圓環</option>
              <option value="bar">長條</option>
            </select>
          </label>
        )}
        <label className="toggle-row">
          <input type="checkbox" checked={value.silent} onChange={(event) => setState({ ...value, silent: event.target.checked })} />
          無聲模式
        </label>
      </Panel>
      <Panel title={isVisual ? "視覺計時" : "倒數投影"}>
        <div className={`${isVisual ? "timer-display visual" : "timer-display"}${warning ? " is-warning" : ""}`}>
          {isVisual && value.visualStyle === "ring" ? (
            <div className="timer-ring" style={{ "--progress": `${progress}%` } as CSSProperties}>
              <span>{mm}:{ss}</span>
            </div>
          ) : isVisual ? (
            <div className="timer-block">
              <strong>{mm}:{ss}</strong>
              <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
            </div>
          ) : (
            <strong>{mm}:{ss}</strong>
          )}
          <p>{value.secondsLeft === 0 ? value.message : warning ? "即將結束" : "剩餘時間"}</p>
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
        <p className="shortcut-hint"><kbd>空白鍵</kbd> 開始/暫停 · <kbd>R</kbd> 重設</p>
      </Panel>
    </div>
  );
}
