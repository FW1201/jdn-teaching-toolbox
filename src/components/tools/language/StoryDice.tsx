import { Shuffle } from "lucide-react";
import { shuffle, textLines } from "../../../lib/toolLogic";
import { Panel, TextAreaField, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function StoryDice({ state, setState }: ToolProps) {
  const value = mergeState(state, { people: "轉學生\n時間旅人\n校園記者", places: "圖書館\n雨天操場\n未來教室", conflicts: "找不到關鍵證據\n必須合作完成任務\n誤會逐漸擴大", objects: "一張舊照片\n會發光的筆\n神秘便條", result: [] as string[], history: [] as string[] });
  const fields = [
    ["人物", "people"],
    ["地點", "places"],
    ["衝突", "conflicts"],
    ["物件", "objects"]
  ] as const;
  function roll() {
    const result = fields.map(([, key]) => shuffle(textLines(value[key]))[0] ?? "");
    setState({ ...value, result, history: [result.filter(Boolean).join(" · "), ...value.history].slice(0, 6) });
  }
  return (
    <div className="tool-grid">
      <Panel title="骰面設定">
        {fields.map(([label, key]) => <TextAreaField key={key} label={label} value={value[key]} onChange={(text) => setState({ ...value, [key]: text })} rows={3} />)}
      </Panel>
      <Panel title="寫作提示">
        <button className="primary-button" onClick={roll}><Shuffle size={16} />擲故事骰</button>
        <div className="dice-result">{fields.map(([label], index) => <div key={label}><span>{label}</span><strong>{value.result[index] ?? "等待擲骰"}</strong></div>)}</div>
        {value.history.length > 0 && (
          <div className="result-list">
            {value.history.map((row, index) => <div key={`${row}-${index}`} className="result-row"><span>{row}</span></div>)}
          </div>
        )}
      </Panel>
    </div>
  );
}
