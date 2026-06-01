import { useState } from "react";
import type { DragEvent } from "react";
import { Check, Shuffle } from "lucide-react";
import { createWordSearch, createBingoCards, shuffle, textLines } from "../../lib/toolLogic";
import { useToast } from "../../hooks/useToast";
import { InputField, Panel, TextAreaField, mergeState } from "../shared";
import type { ToolProps } from "../shared";

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

export function WordSearchTool({ state, setState }: ToolProps) {
  const value = mergeState(state, { words: "STORY\nMEDIA\nCLASS\nLEARN", size: 10, puzzle: null as null | ReturnType<typeof createWordSearch>, showAnswers: false });
  const puzzle = value.puzzle ?? createWordSearch(textLines(value.words), value.size);

  // 計算答案覆蓋的格子，顯示解答時直接在方格上高亮
  const highlighted = new Set<string>();
  if (value.showAnswers) {
    puzzle.placements.forEach((item) => {
      const length = [...item.word].length;
      for (let offset = 0; offset < length; offset += 1) {
        const r = item.dir === "H" ? item.row : item.row + offset;
        const c = item.dir === "H" ? item.col + offset : item.col;
        highlighted.add(`${r}-${c}`);
      }
    });
  }

  return (
    <div className="tool-grid">
      <Panel title="字詞表">
        <TextAreaField label="每行一個字詞" value={value.words} onChange={(words) => setState({ ...value, words, puzzle: null })} />
        <InputField label="方格大小" type="number" min={6} value={value.size} onChange={(size) => setState({ ...value, size: Number(size), puzzle: null })} />
        <button className="primary-button" onClick={() => setState({ ...value, puzzle: createWordSearch(textLines(value.words), value.size) })}>產生方格</button>
      </Panel>
      <Panel title="字詞搜尋">
        <div className="word-grid" style={{ gridTemplateColumns: `repeat(${value.size}, 1fr)` }}>{puzzle.grid.flatMap((row, rowIndex) => row.map((cell, colIndex) => <span key={`${rowIndex}-${colIndex}`} className={highlighted.has(`${rowIndex}-${colIndex}`) ? "found" : undefined}>{cell}</span>))}</div>
        <label className="toggle-row"><input type="checkbox" checked={value.showAnswers} onChange={(event) => setState({ ...value, puzzle, showAnswers: event.target.checked })} />顯示解答（方格高亮）</label>
        {value.showAnswers && <div className="answer-list">{puzzle.placements.map((item) => <span key={item.word}>{item.word}（{item.dir === "H" ? "橫" : "直"}）</span>)}</div>}
      </Panel>
    </div>
  );
}

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
