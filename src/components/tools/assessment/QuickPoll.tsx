import { Download, Minus, Plus, Trash2 } from "lucide-react";
import { escapeCsv } from "../../../lib/toolLogic";
import { useExport } from "../../../providers/ExportProvider";
import { useToast } from "../../../hooks/useToast";
import { InputField, Panel, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function QuickPoll({ state, setState }: ToolProps) {
  const { downloadText } = useExport();
  const { notify } = useToast();
  const value = mergeState(state, { question: "你覺得今天最需要再複習的是？", options: ["概念", "例題", "操作", "合作"], votes: [0, 0, 0, 0] });

  function addVote(index: number, delta: number) {
    setState({ ...value, votes: value.votes.map((vote, voteIndex) => (voteIndex === index ? Math.max(0, vote + delta) : vote)) });
  }
  const max = Math.max(1, ...value.votes);
  const csv = ["選項,票數", ...value.options.map((option, index) => [option, String(value.votes[index] ?? 0)].map(escapeCsv).join(","))].join("\n");

  function updateOption(index: number, option: string) {
    setState({ ...value, options: value.options.map((item, itemIndex) => (itemIndex === index ? option : item)) });
  }

  return (
    <div className="tool-grid">
      <Panel title="投票題目">
        <InputField label="題目" value={value.question} onChange={(question) => setState({ ...value, question })} />
        <div className="list-editor">
          {value.options.map((option, index) => (
            <div className="list-row" key={index}>
              <input value={option} onChange={(event) => updateOption(index, event.target.value)} />
              <button className="icon-only" onClick={() => setState({ ...value, options: value.options.filter((_, itemIndex) => itemIndex !== index), votes: value.votes.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <button className="secondary-button" onClick={() => setState({ ...value, options: [...value.options, `選項 ${value.options.length + 1}`], votes: [...value.votes, 0] })}><Plus size={16} />新增選項</button>
      </Panel>
      <Panel title="投影統計" action={<button className="ghost-button" onClick={() => { downloadText("poll.csv", csv, "text/csv;charset=utf-8"); notify("已匯出投票結果 CSV", "success"); }}><Download size={16} />CSV</button>}>
        <div className="poll-card">
          <h3>{value.question}</h3>
          {value.options.map((option, index) => (
            <div className="poll-row" key={option}>
              <button onClick={() => addVote(index, -1)} aria-label="減一票"><Minus size={15} /></button>
              <button onClick={() => addVote(index, 1)}>+1</button>
              <span>{option}</span>
              <div className="bar"><i style={{ width: `${((value.votes[index] ?? 0) / max) * 100}%` }} /></div>
              <strong>{value.votes[index] ?? 0}</strong>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
