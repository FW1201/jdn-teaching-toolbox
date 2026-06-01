import { Download } from "lucide-react";
import { useExport } from "../../../providers/ExportProvider";
import { useToast } from "../../../hooks/useToast";
import { InputField, Panel, exportElementAsPng, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

const annotationTypes = [
  { id: "keyword", label: "關鍵詞", color: "#f4d35e" },
  { id: "evidence", label: "證據", color: "#a8d8c4" },
  { id: "question", label: "疑問", color: "#fcab79" }
];

export function TextAnnotator({ state, setState }: ToolProps) {
  const { downloadJson } = useExport();
  const { notify } = useToast();
  const value = mergeState(state, {
    title: "閱讀文本標註",
    text: "數位敘事力是一種把資訊、媒體與故事結構整合的表達能力。學生可以透過標註關鍵詞、證據與疑問，逐步建立文本理解。",
    selectedType: "keyword",
    marks: [] as Array<{ id: string; type: string; text: string }>
  });
  const paragraphs = value.text.split(/\n+/).filter(Boolean);
  const activeType = annotationTypes.find((type) => type.id === value.selectedType) ?? annotationTypes[0];

  function addMark(raw: string) {
    const text = raw.trim();
    if (!text) return;
    setState({ ...value, marks: [{ id: crypto.randomUUID(), type: value.selectedType, text }, ...value.marks] });
  }

  function renderParagraph(paragraph: string) {
    const mark = value.marks.find((item) => paragraph.includes(item.text));
    const type = mark ? annotationTypes.find((item) => item.id === mark.type) : undefined;
    return <p key={paragraph} style={type ? { borderLeftColor: type.color, background: `${type.color}22` } : undefined}>{paragraph}</p>;
  }

  return (
    <div className="tool-grid">
      <Panel title="文本與標註">
        <InputField label="標題" value={value.title} onChange={(title) => setState({ ...value, title })} />
        <label className="field"><span>文本</span><textarea rows={9} value={value.text} onChange={(event) => setState({ ...value, text: event.target.value })} /></label>
        <div className="quick-buttons">{annotationTypes.map((type) => <button key={type.id} className={value.selectedType === type.id ? "active" : ""} onClick={() => setState({ ...value, selectedType: type.id })}>{type.label}</button>)}</div>
        <label className="field"><span>新增{activeType.label}標註文字</span><input onKeyDown={(event) => { if (event.key === "Enter") { addMark(event.currentTarget.value); event.currentTarget.value = ""; } }} placeholder="輸入文本中的詞句後按 Enter" /></label>
        <div className="answer-list">{value.marks.map((mark) => <span key={mark.id}>{annotationTypes.find((type) => type.id === mark.type)?.label}: {mark.text}</span>)}</div>
      </Panel>
      <Panel
        title="投影文本"
        action={
          <>
            <button className="ghost-button" onClick={() => { downloadJson("text-annotator.json", value); notify("已匯出標註 JSON", "success"); }}><Download size={16} />JSON</button>
            <button className="ghost-button" onClick={() => { void exportElementAsPng("text-annotator-export", "text-annotator.png"); notify("已匯出標註 PNG", "success"); }}><Download size={16} />PNG</button>
          </>
        }
      >
        <div className="text-annotator-preview" id="text-annotator-export">
          <h2>{value.title}</h2>
          {paragraphs.map(renderParagraph)}
        </div>
      </Panel>
    </div>
  );
}
