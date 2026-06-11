import { Download } from "lucide-react";
import { escapeCsv, textLines } from "../../../lib/toolLogic";
import { useExport } from "../../../providers/ExportProvider";
import { useToast } from "../../../hooks/useToast";
import { ConfirmButton } from "../../ui/ConfirmButton";
import { StatBar } from "../../ui/StatBar";
import { Panel, TextAreaField, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function Scoreboard({ state, setState }: ToolProps) {
  const { downloadText } = useExport();
  const { notify } = useToast();
  const value = mergeState(state, { teamsText: "第一組\n第二組\n第三組\n第四組", scores: {} as Record<string, number>, history: [] as string[] });
  const teams = textLines(value.teamsText);

  function adjust(team: string, delta: number) {
    const score = (value.scores[team] ?? 0) + delta;
    setState({ ...value, scores: { ...value.scores, [team]: score }, history: [`${new Date().toLocaleTimeString()} ${team} ${delta > 0 ? "+" : ""}${delta}`, ...value.history] });
  }

  const ranking = [...teams].sort((a, b) => (value.scores[b] ?? 0) - (value.scores[a] ?? 0));
  const csv = ["隊伍,分數", ...ranking.map((team) => [team, String(value.scores[team] ?? 0)].map(escapeCsv).join(","))].join("\n");

  return (
    <div className="tool-grid">
      <Panel title="隊伍設定">
        <TextAreaField label="每行一隊" value={value.teamsText} onChange={(teamsText) => setState({ ...value, teamsText })} />
        <ConfirmButton className="secondary-button" onConfirm={() => { setState({ ...value, scores: {}, history: [] }); notify("已重設所有分數"); }}>重設分數</ConfirmButton>
      </Panel>
      <Panel title="投影排名" action={<button className="ghost-button" onClick={() => { downloadText("scoreboard.csv", csv, "text/csv;charset=utf-8"); notify("已匯出計分結果 CSV", "success"); }}><Download size={16} />CSV</button>}>
        <div className="score-list">
          {ranking.map((team, index) => {
            const score = value.scores[team] ?? 0;
            const topScore = Math.max(1, ...ranking.map((name) => value.scores[name] ?? 0));
            return (
              <div className="score-entry" key={team}>
                <div className="score-row">
                  <span>{index + 1}</span>
                  <strong>{team}</strong>
                  <button onClick={() => adjust(team, -1)} aria-label={`${team} 減 1 分`}>-1</button>
                  <em>{score}</em>
                  <button onClick={() => adjust(team, 1)} aria-label={`${team} 加 1 分`}>+1</button>
                  <button onClick={() => adjust(team, 5)} aria-label={`${team} 加 5 分`}>+5</button>
                </div>
                <StatBar value={score} max={topScore} tone={index === 0 && score > 0 ? "primary" : "neutral"} showValue={false} />
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
