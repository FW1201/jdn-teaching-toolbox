import { createWordSearch, textLines } from "../../../lib/toolLogic";
import { InputField, Panel, TextAreaField, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function WordSearchTool({ state, setState }: ToolProps) {
  const value = mergeState(state, { words: "STORY\nMEDIA\nCLASS\nLEARN", size: 10, puzzle: null as null | ReturnType<typeof createWordSearch>, showAnswers: false });
  const puzzle = value.puzzle ?? createWordSearch(textLines(value.words), value.size);

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
