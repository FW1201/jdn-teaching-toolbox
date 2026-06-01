import { useState } from "react";
import type { DragEvent } from "react";
import { textLines } from "../../../lib/toolLogic";
import { Panel, TextAreaField, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function CardSort({ state, setState }: ToolProps) {
  const value = mergeState(state, { categories: "概念\n例子\n疑問", cards: "主旨\n段落大意\n作者觀點\n文本證據\n反例", placed: {} as Record<string, string> });
  const categories = textLines(value.categories);
  const cards = textLines(value.cards);
  const [activeCol, setActiveCol] = useState<string | null>(null);
  const sortedCount = cards.filter((card) => value.placed[card]).length;

  function place(card: string, category: string) {
    setState({ ...value, placed: { ...value.placed, [card]: category } });
  }

  return (
    <div className="tool-grid">
      <Panel title="卡片與分類">
        <TextAreaField label="分類欄" value={value.categories} onChange={(categoriesText) => setState({ ...value, categories: categoriesText })} />
        <TextAreaField label="概念卡" value={value.cards} onChange={(cardsText) => setState({ ...value, cards: cardsText })} />
      </Panel>
      <Panel title="拖曳分類">
        <div className="tool-meta-line"><span>已分類 <strong>{sortedCount}</strong> / {cards.length} 張</span><span>點已分類卡片可退回</span></div>
        <div className="unsorted-cards">{cards.filter((card) => !value.placed[card]).map((card) => <button draggable key={card} onDragStart={(event: DragEvent<HTMLButtonElement>) => event.dataTransfer.setData("text/plain", card)}>{card}</button>)}</div>
        <div className="sort-columns">
          {categories.map((category) => (
            <div
              key={category}
              className={`sort-column${activeCol === category ? " drop-active" : ""}`}
              onDragOver={(event) => event.preventDefault()}
              onDragEnter={() => setActiveCol(category)}
              onDragLeave={() => setActiveCol((current) => (current === category ? null : current))}
              onDrop={(event) => { place(event.dataTransfer.getData("text/plain"), category); setActiveCol(null); }}
            >
              <h4>{category}</h4>
              {cards.filter((card) => value.placed[card] === category).map((card) => <button key={card} onClick={() => place(card, "")}>{card}</button>)}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
