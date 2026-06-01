import { Shuffle } from "lucide-react";
import { shuffle, textLines } from "../../../lib/toolLogic";
import { useToast } from "../../../hooks/useToast";
import { Panel, TextAreaField, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function Flashcards({ state, setState }: ToolProps) {
  const { notify } = useToast();
  const value = mergeState(state, { input: "民主,人民作主的政治制度\nphotosynthesis,光合作用\n敘事,把事件組織成有意義的表達", cards: [] as Array<{ front: string; back: string }>, index: 0, flipped: false });
  const cards = value.cards.length ? value.cards : textLines(value.input).map((line) => {
    const [front, ...rest] = line.split(/,|\t/);
    return { front: front ?? "", back: rest.join(" / ") };
  });
  const total = Math.max(1, cards.length);
  const position = (value.index % total) + 1;
  const current = cards[value.index % total];

  return (
    <div className="tool-grid">
      <Panel title="批次匯入">
        <TextAreaField label="正面,背面" rows={8} value={value.input} onChange={(input) => setState({ ...value, input, cards: [], index: 0 })} />
        <button className="secondary-button" onClick={() => { setState({ ...value, cards: shuffle(cards), index: 0, flipped: false }); notify("已洗牌並回到第一張"); }}><Shuffle size={16} />洗牌</button>
      </Panel>
      <Panel title="投影字詞卡">
        <div className="tool-meta-line"><span>第 <strong>{position}</strong> / {total} 張</span><span>點卡片可翻面</span></div>
        <button className={value.flipped ? "flashcard flipped" : "flashcard"} onClick={() => setState({ ...value, flipped: !value.flipped })}>
          <span>{value.flipped ? "背面" : "正面"}</span>
          <strong>{value.flipped ? current?.back : current?.front}</strong>
        </button>
        <div className="progress-track"><span style={{ width: `${(position / total) * 100}%` }} /></div>
        <div className="action-row">
          <button className="secondary-button" onClick={() => setState({ ...value, index: Math.max(0, value.index - 1), flipped: false })}>上一張</button>
          <button className="primary-button" onClick={() => setState({ ...value, index: (value.index + 1) % total, flipped: false })}>下一張</button>
        </div>
      </Panel>
    </div>
  );
}
