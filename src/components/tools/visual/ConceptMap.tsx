import { Download } from "lucide-react";
import { textLines } from "../../../lib/toolLogic";
import { useToast } from "../../../hooks/useToast";
import { Panel, TextAreaField, exportElementAsPng, mergeState, pointOnCircle } from "../../shared";
import type { ToolProps } from "../../shared";

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
      <Panel title="概念圖" action={<button className="ghost-button" onClick={() => { void exportElementAsPng("concept-map-export", "concept-map.png"); notify("已匯出概念圖 PNG", "success"); }}><Download size={16} />PNG</button>}>
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
