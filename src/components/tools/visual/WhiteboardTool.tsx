import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import { Download, Eraser, Plus, Redo2, Trash2, Undo2 } from "lucide-react";
import { useToast } from "../../../hooks/useToast";
import { InputField, Panel, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function WhiteboardTool({ state, setState }: ToolProps) {
  const value = mergeState(state, { color: "#fcd535", width: 4, notes: [] as Array<{ id: string; text: string }> });
  const { notify } = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
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
