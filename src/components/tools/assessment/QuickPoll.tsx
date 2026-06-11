import { Download, Minus, Plus, Trash2 } from "lucide-react";
import { escapeCsv } from "../../../lib/toolLogic";
import { useExport } from "../../../providers/ExportProvider";
import { useToast } from "../../../hooks/useToast";
import { InputField, Panel, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";
import { ConfirmButton } from "../../ui/ConfirmButton";
import { StatBar } from "../../ui/StatBar";

export function QuickPoll({ state, setState }: ToolProps) {
  const { downloadText } = useExport();
  const { notify } = useToast();
  const value = mergeState(state, {
    mode: "poll" as "poll" | "meter",
    question: "你覺得今天最需要再複習的是？",
    options: ["概念", "例題", "操作", "合作"],
    votes: [0, 0, 0, 0],
    labels: ["完全不懂", "有點模糊", "大致理解", "可以練習", "能教別人"],
    counts: [0, 0, 0, 0, 0],
    note: ""
  });

  function addVote(index: number, delta: number) {
    setState({ ...value, votes: value.votes.map((vote, voteIndex) => (voteIndex === index ? Math.max(0, vote + delta) : vote)) });
  }
  const max = Math.max(1, ...value.votes);
  const csv = ["選項,票數", ...value.options.map((option, index) => [option, String(value.votes[index] ?? 0)].map(escapeCsv).join(","))].join("\n");
  const meterTotal = value.counts.reduce((sum, count) => sum + count, 0);
  const meterCsv = ["分數,標籤,人數,備註", ...value.labels.map((label, index) => [String(index + 1), label, String(value.counts[index] ?? 0), value.note].map(escapeCsv).join(","))].join("\n");

  function updateOption(index: number, option: string) {
    setState({ ...value, options: value.options.map((item, itemIndex) => (itemIndex === index ? option : item)) });
  }

  return (
    <div className="tool-grid">
      <Panel title="投票題目">
        <div className="quick-buttons">
          <button className={value.mode === "poll" ? "active" : ""} onClick={() => setState({ ...value, mode: "poll" })}>投票</button>
          <button className={value.mode === "meter" ? "active" : ""} onClick={() => setState({ ...value, mode: "meter" })}>理解溫度計</button>
        </div>
        <InputField label="題目" value={value.question} onChange={(question) => setState({ ...value, question })} />
        {value.mode === "poll" ? (
          <>
            <div className="list-editor">
              {value.options.map((option, index) => (
                <div className="list-row" key={index}>
                  <input value={option} onChange={(event) => updateOption(index, event.target.value)} />
                  <button className="icon-only" aria-label="刪除選項" onClick={() => setState({ ...value, options: value.options.filter((_, itemIndex) => itemIndex !== index), votes: value.votes.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <button className="secondary-button" onClick={() => setState({ ...value, options: [...value.options, `選項 ${value.options.length + 1}`], votes: [...value.votes, 0] })}><Plus size={16} />新增選項</button>
          </>
        ) : (
          <>
            <div className="list-editor">
              {value.labels.map((label, index) => (
                <div className="list-row compact-row" key={index}>
                  <input value={label} onChange={(event) => setState({ ...value, labels: value.labels.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)) })} />
                </div>
              ))}
            </div>
            <label className="field"><span>備註</span><textarea rows={3} value={value.note} onChange={(event) => setState({ ...value, note: event.target.value })} /></label>
          </>
        )}
      </Panel>
      <Panel title="投影統計" action={<button className="ghost-button" onClick={() => { downloadText(value.mode === "poll" ? "poll.csv" : "understanding-meter.csv", value.mode === "poll" ? csv : meterCsv, "text/csv;charset=utf-8"); notify("已匯出回饋結果 CSV", "success"); }}><Download size={16} />CSV</button>}>
        {value.mode === "poll" ? (
          <div className="poll-card">
            <h3>{value.question}</h3>
            {value.options.map((option, index) => {
              const votes = value.votes[index] ?? 0;
              const total = value.votes.reduce((sum, count) => sum + count, 0);
              const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
              const leading = votes > 0 && votes === Math.max(...value.votes);
              return (
                <div className="poll-row" key={option}>
                  <button onClick={() => addVote(index, -1)} aria-label={`${option} 減一票`}><Minus size={15} /></button>
                  <button onClick={() => addVote(index, 1)} aria-label={`${option} 加一票`}>+1</button>
                  <span>{option}</span>
                  <StatBar value={votes} max={max} tone={leading ? "primary" : "neutral"} showValue={false} />
                  <strong>{votes} 票 · {pct}%</strong>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="poll-card">
            <h3>{value.question}</h3>
            <p>總人次：{meterTotal}</p>
            <div className="meter-grid">
              {value.labels.map((label, index) => (
                <button key={label} className="meter-card" onClick={() => setState({ ...value, counts: value.counts.map((count, countIndex) => (countIndex === index ? count + 1 : count)) })}>
                  <strong>{index + 1}</strong>
                  <span>{label}</span>
                  <em>{value.counts[index] ?? 0}</em>
                </button>
              ))}
            </div>
            <ConfirmButton onConfirm={() => setState({ ...value, counts: [0, 0, 0, 0, 0] })}>清空統計</ConfirmButton>
          </div>
        )}
      </Panel>
    </div>
  );
}
