import { textLines } from "../../../lib/toolLogic";
import { Panel, TextAreaField, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function ClozeTool({ state, setState }: ToolProps) {
  const value = mergeState(state, { text: "數位敘事力是一種把資訊、媒體與故事結構整合的表達能力。", answers: "數位敘事力\n資訊\n故事結構", showAnswers: false });
  const answers = textLines(value.answers);
  const cloze = answers.reduce((content, answer, index) => {
    const blank = `（${index + 1}）${"＿".repeat(Math.max(2, [...answer].length))}`;
    return content.replaceAll(answer, value.showAnswers ? `【${answer}】` : blank);
  }, value.text);

  return (
    <div className="tool-grid">
      <Panel title="文本與答案">
        <TextAreaField label="文本" rows={6} value={value.text} onChange={(text) => setState({ ...value, text })} />
        <TextAreaField label="要挖空的答案" value={value.answers} onChange={(answersText) => setState({ ...value, answers: answersText })} />
        <label className="toggle-row"><input type="checkbox" checked={value.showAnswers} onChange={(event) => setState({ ...value, showAnswers: event.target.checked })} />顯示答案</label>
      </Panel>
      <Panel title="題目版">
        <div className="worksheet-preview">{cloze}</div>
      </Panel>
    </div>
  );
}
