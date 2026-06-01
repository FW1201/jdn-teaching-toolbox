import { useRef, useState } from "react";
import type { DragEvent, PointerEvent } from "react";
import { Download, Eraser, Plus, Redo2, Trash2, Undo2 } from "lucide-react";
import { textLines } from "../../lib/toolLogic";
import { useToast } from "../../hooks/useToast";
import { InputField, Panel, TextAreaField, exportElementAsPng, mergeState, pointOnCircle } from "../shared";
import type { ToolProps } from "../shared";

export function WhiteboardTool({ state, setState }: ToolProps) {
  const value = mergeState(state, { color: "#00d4ff", width: 4, notes: [] as Array<{ id: string; text: string }> });
  const { notify } = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  // 以畫布快照堆疊實作 undo/redo（畫布為命令式繪圖，非 React 狀態）
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const [, force] = useState(0);

  function snapshot() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    undoStack.current = [...undoStack.current, canvas.toDataURL()].slice(-30);
    redoStack.current = [];
    force((n) => n + 1);
  }

  function restore(dataUrl: string | undefined) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!dataUrl) return;
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = dataUrl;
  }

  function undo() {
    if (!undoStack.current.length) return;
    const current = canvasRef.current?.toDataURL();
    const previous = undoStack.current[undoStack.current.length - 1];
    undoStack.current = undoStack.current.slice(0, -1);
    if (current) redoStack.current = [current, ...redoStack.current];
    restore(previous);
    force((n) => n + 1);
  }

  function redo() {
    if (!redoStack.current.length) return;
    const next = redoStack.current[0];
    redoStack.current = redoStack.current.slice(1);
    const current = canvasRef.current?.toDataURL();
    if (current) undoStack.current = [...undoStack.current, current];
    restore(next);
    force((n) => n + 1);
  }

  function draw(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || !drawing.current) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = value.width;
    ctx.lineCap = "round";
    ctx.strokeStyle = value.color;
    ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    ctx.stroke();
  }

  function start(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    snapshot();
    drawing.current = true;
    ctx.beginPath();
    ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    snapshot();
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    notify("已清除畫布");
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    notify("已下載白板 PNG", "success");
  }

  return (
    <div className="tool-grid">
      <Panel title="白板工具">
        <div className="two-col">
          <InputField label="筆色" type="color" value={value.color} onChange={(color) => setState({ ...value, color })} />
          <InputField label="筆粗" type="number" min={1} value={value.width} onChange={(width) => setState({ ...value, width: Number(width) })} />
        </div>
        <div className="action-row">
          <button className="secondary-button" disabled={!undoStack.current.length} onClick={undo}><Undo2 size={16} />復原</button>
          <button className="secondary-button" disabled={!redoStack.current.length} onClick={redo}><Redo2 size={16} />重做</button>
        </div>
        <button className="secondary-button" onClick={() => setState({ ...value, notes: [...value.notes, { id: crypto.randomUUID(), text: "便利貼" }] })}><Plus size={16} />便利貼</button>
        <button className="secondary-button" onClick={clear}><Eraser size={16} />清除</button>
        <button className="primary-button" onClick={download}><Download size={16} />PNG</button>
      </Panel>
      <Panel title="畫布">
        <div className="whiteboard-wrap">
          <canvas ref={canvasRef} width={980} height={560} onPointerDown={start} onPointerMove={draw} onPointerUp={() => (drawing.current = false)} onPointerLeave={() => (drawing.current = false)} />
          <div className="sticky-layer">{value.notes.map((note) => (
            <div className="sticky-note" key={note.id}>
              <textarea value={note.text} onChange={(event) => setState({ ...value, notes: value.notes.map((entry) => (entry.id === note.id ? { ...entry, text: event.target.value } : entry)) })} />
              <button className="sticky-delete" onClick={() => setState({ ...value, notes: value.notes.filter((entry) => entry.id !== note.id) })} aria-label="刪除便利貼"><Trash2 size={14} /></button>
            </div>
          ))}</div>
        </div>
      </Panel>
    </div>
  );
}

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

export function ConceptMap({ state, setState }: ToolProps) {
  const { notify } = useToast();
  const value = mergeState(state, { nodes: "數位敘事\n媒體\n故事\n受眾", links: "數位敘事,結合,媒體\n數位敘事,組織,故事\n故事,影響,受眾" });
  const nodes = textLines(value.nodes);
  const links = textLines(value.links).map((line) => line.split(/,|，/).map((part) => part.trim()));
  const centerX = 330;
  const centerY = 220;

  return (
    <div className="tool-grid">
      <Panel title="節點與關係">
        <TextAreaField label="節點" value={value.nodes} onChange={(nodesText) => setState({ ...value, nodes: nodesText })} />
        <TextAreaField label="連線：A,關係,B" value={value.links} onChange={(linksText) => setState({ ...value, links: linksText })} />
      </Panel>
      <Panel title="概念圖" action={<button className="ghost-button" onClick={() => exportElementAsPng("concept-map-export", "concept-map.png")}><Download size={16} />PNG</button>}>
        <svg className="concept-svg" id="concept-map-export" viewBox="0 0 720 460">
          {links.map(([from, label, to], index) => {
            const fromIndex = Math.max(0, nodes.indexOf(from));
            const toIndex = Math.max(0, nodes.indexOf(to));
            const a = pointOnCircle(fromIndex, nodes.length, centerX, centerY, 160);
            const b = pointOnCircle(toIndex, nodes.length, centerX, centerY, 160);
            return <g key={`${from}-${to}-${index}`}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} /><text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2}>{label}</text></g>;
          })}
          {nodes.map((node, index) => {
            const point = pointOnCircle(index, nodes.length, centerX, centerY, 160);
            return <g key={node}><circle cx={point.x} cy={point.y} r="48" /><text x={point.x} y={point.y}>{node}</text></g>;
          })}
        </svg>
      </Panel>
    </div>
  );
}

export function TimelineTool({ state, setState }: ToolProps) {
  const value = mergeState(state, { events: "1911,辛亥革命,政治\n1949,政府遷臺,政治\n1987,解除戒嚴,社會\n2020,遠距教學普及,教育" });
  const events = textLines(value.events)
    .map((line) => {
      const [date, title, category] = line.split(/,|，/).map((part) => part.trim());
      return { date, title, category };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="tool-grid">
      <Panel title="事件資料">
        <TextAreaField label="日期,事件,分類" rows={8} value={value.events} onChange={(eventsText) => setState({ ...value, events: eventsText })} />
      </Panel>
      <Panel title="時間軸">
        <div className="timeline">{events.map((event) => <div key={`${event.date}-${event.title}`}><span>{event.date}</span><strong>{event.title}</strong><small>{event.category}</small></div>)}</div>
      </Panel>
    </div>
  );
}
