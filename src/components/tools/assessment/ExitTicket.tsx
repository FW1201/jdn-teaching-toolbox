import { Download, Plus, Trash2 } from "lucide-react";
import { useExport } from "../../../providers/ExportProvider";
import { useToast } from "../../../hooks/useToast";
import { InputField, Panel, TextAreaField, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function ExitTicket({ state, setState }: ToolProps) {
  const { downloadText } = useExport();
  const { notify } = useToast();
  const value = mergeState(state, { title: "課末三問", questions: ["今天我學到...", "我還不確定...", "下一步我想..."], notes: "" });
  const output = `${value.title}\n\n${value.questions.map((question, index) => `${index + 1}. ${question}`).join("\n")}\n\n教師紀錄：\n${value.notes}`;

  return (
    <div className="tool-grid">
      <Panel title="題目模板">
        <InputField label="標題" value={value.title} onChange={(title) => setState({ ...value, title })} />
        <div className="list-editor">
          {value.questions.map((question, index) => (
            <div className="list-row" key={index}>
              <input value={question} onChange={(event) => setState({ ...value, questions: value.questions.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)) })} />
              <button className="icon-only" disabled={value.questions.length <= 1} onClick={() => setState({ ...value, questions: value.questions.filter((_, itemIndex) => itemIndex !== index) })} aria-label="刪除問題"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <button className="secondary-button" onClick={() => setState({ ...value, questions: [...value.questions, "新的問題..."] })}><Plus size={16} />新增問題</button>
        <TextAreaField label="教師紀錄" value={value.notes} onChange={(notes) => setState({ ...value, notes })} />
      </Panel>
      <Panel title="投影題目" action={<button className="ghost-button" onClick={() => { downloadText("exit-ticket.txt", output); notify("已匯出課末問題", "success"); }}><Download size={16} />匯出</button>}>
        <div className="projection-card">
          <h2>{value.title}</h2>
          <ol className="big-list">{value.questions.map((question, index) => <li key={index}>{question}</li>)}</ol>
        </div>
      </Panel>
    </div>
  );
}
