import { textLines } from "../../../lib/toolLogic";
import { Panel, TextAreaField, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

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
