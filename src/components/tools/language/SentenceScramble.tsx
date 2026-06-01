import type { DragEvent } from "react";
import { Shuffle } from "lucide-react";
import { shuffle } from "../../../lib/toolLogic";
import { Panel, TextAreaField, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function SentenceScramble({ state, setState }: ToolProps) {
  const value = mergeState(state, { sentence: "學生 在 課堂 中 透過 討論 建構 理解", pieces: [] as string[] });
  const pieces = value.pieces.length ? value.pieces : shuffle(value.sentence.split(/\s+/).filter(Boolean));
  const target = value.sentence.trim().split(/\s+/).filter(Boolean).join(" ");
  const isCorrect = pieces.length > 0 && pieces.join(" ") === target;

  function move(from: number, to: number) {
    const next = [...pieces];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setState({ ...value, pieces: next });
  }

  return (
    <div className="tool-grid">
      <Panel title="句子設定">
        <TextAreaField label="用空白切分片段" rows={4} value={value.sentence} onChange={(sentence) => setState({ ...value, sentence, pieces: [] })} />
        <button className="secondary-button" onClick={() => setState({ ...value, pieces: shuffle(value.sentence.split(/\s+/).filter(Boolean)) })}><Shuffle size={16} />重新打散</button>
      </Panel>
      <Panel title="拖曳排序">
        <div className="piece-board">
          {pieces.map((piece, index) => (
            <button
              draggable
              key={`${piece}-${index}`}
              onDragStart={(event: DragEvent<HTMLButtonElement>) => event.dataTransfer.setData("text/plain", String(index))}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => move(Number(event.dataTransfer.getData("text/plain")), index)}
            >
              {piece}
            </button>
          ))}
        </div>
        <div className="sentence-output">{pieces.join(" ")}</div>
        <div className={`notice-row ${isCorrect ? "success" : ""}`}>{isCorrect ? "✓ 順序正確！" : "拖曳片段排出正確語序"}</div>
      </Panel>
    </div>
  );
}
