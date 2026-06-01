import { createBingoCards, textLines } from "../../../lib/toolLogic";
import { InputField, Panel, TextAreaField, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function BingoTool({ state, setState }: ToolProps) {
  const value = mergeState(state, { words: "閱讀\n摘要\n提問\n證據\n推論\n主旨\n觀點\n結論\n例子", size: 3, count: 2, cards: [] as string[][][] });
  const cards = value.cards.length ? value.cards : createBingoCards(textLines(value.words), value.size, value.count);

  return (
    <div className="tool-grid">
      <Panel title="賓果設定">
        <TextAreaField label="詞語" value={value.words} onChange={(words) => setState({ ...value, words, cards: [] })} />
        <div className="two-col">
          <InputField label="尺寸" type="number" min={3} value={value.size} onChange={(size) => setState({ ...value, size: Number(size), cards: [] })} />
          <InputField label="份數" type="number" min={1} value={value.count} onChange={(count) => setState({ ...value, count: Number(count), cards: [] })} />
        </div>
        <button className="primary-button" onClick={() => setState({ ...value, cards: createBingoCards(textLines(value.words), value.size, value.count) })}>產生賓果卡</button>
      </Panel>
      <Panel title="列印預覽">
        <div className="bingo-list">{cards.map((card, cardIndex) => {
          const center = value.size % 2 === 1 ? Math.floor(value.size / 2) : -1;
          return (
            <div key={cardIndex} className="bingo-card" style={{ gridTemplateColumns: `repeat(${value.size}, 1fr)` }}>
              {card.flatMap((row, rowIndex) => row.map((cell, colIndex) => {
                const isFree = rowIndex === center && colIndex === center;
                return <span key={`${cardIndex}-${rowIndex}-${colIndex}`} className={isFree ? "bingo-free" : undefined}>{isFree ? "FREE" : cell}</span>;
              }))}
            </div>
          );
        })}</div>
      </Panel>
    </div>
  );
}
