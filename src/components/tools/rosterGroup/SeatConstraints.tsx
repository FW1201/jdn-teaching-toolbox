import { textLines } from "../../../lib/toolLogic";
import { useRoster } from "../../../providers/RosterProvider";
import { Panel, TextAreaField, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function SeatConstraints({ state, setState }: ToolProps) {
  const { roster } = useRoster();
  const value = mergeState(state, { apart: "", front: "", back: "" });
  const apartNames = textLines(value.apart).map((line) => line.split(/,|、|\s+/).filter(Boolean));
  const conflicts = apartNames
    .filter((pair) => pair.length >= 2)
    .map((pair) => `${pair[0]} 與 ${pair[1]} 需分開`)
    .filter((text) => roster.some((student) => text.includes(student.name)));

  return (
    <div className="tool-grid">
      <Panel title="限制條件">
        <TextAreaField label="需分開（每行一組，可用逗號）" value={value.apart} onChange={(apart) => setState({ ...value, apart })} placeholder="王小明,陳小華" />
        <TextAreaField label="前排偏好" value={value.front} onChange={(front) => setState({ ...value, front })} placeholder="需要前排或視力提醒" />
        <TextAreaField label="後排偏好" value={value.back} onChange={(back) => setState({ ...value, back })} placeholder="可坐後排名單" />
      </Panel>
      <Panel title="檢查結果">
        <div className="result-list">
          {conflicts.length ? conflicts.map((conflict) => <div className="notice-row warning" key={conflict}>{conflict}</div>) : <div className="notice-row success">目前限制已記錄，可回到座位表重新排座。</div>}
          <div className="notice-row">前排：{textLines(value.front).join("、") || "未設定"}</div>
          <div className="notice-row">後排：{textLines(value.back).join("、") || "未設定"}</div>
        </div>
      </Panel>
    </div>
  );
}
