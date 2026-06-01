import { Check } from "lucide-react";
import type { CSSProperties } from "react";
import { textLines } from "../../../lib/toolLogic";
import { Panel, TextAreaField, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function TaskChecklist({ state, setState }: ToolProps) {
  const value = mergeState(state, { groups: "第一組\n第二組\n第三組\n第四組", tasks: "閱讀文本\n完成討論\n寫下結論\n準備分享", done: {} as Record<string, boolean> });
  const groups = textLines(value.groups);
  const tasks = textLines(value.tasks);

  function toggle(group: string, task: string) {
    const key = `${group}:${task}`;
    setState({ ...value, done: { ...value.done, [key]: !value.done[key] } });
  }

  return (
    <div className="tool-grid">
      <Panel title="任務設定">
        <TextAreaField label="小組" value={value.groups} onChange={(groupsText) => setState({ ...value, groups: groupsText })} />
        <TextAreaField label="任務" value={value.tasks} onChange={(tasksText) => setState({ ...value, tasks: tasksText })} />
      </Panel>
      <Panel title="完成狀態">
        <div className="check-matrix" style={{ "--task-count": tasks.length } as CSSProperties}>
          <div />
          {tasks.map((task) => <strong key={task}>{task}</strong>)}
          {groups.flatMap((group) => {
            const doneCount = tasks.filter((task) => value.done[`${group}:${task}`]).length;
            return [
              <strong key={`${group}-label`}>{group}<small className="matrix-progress">{doneCount}/{tasks.length}</small></strong>,
              ...tasks.map((task) => {
                const key = `${group}:${task}`;
                return <button key={key} className={value.done[key] ? "checked" : ""} onClick={() => toggle(group, task)}>{value.done[key] ? <Check size={18} /> : ""}</button>;
              })
            ];
          })}
        </div>
      </Panel>
    </div>
  );
}
