import { ArrowLeft, Monitor, Star } from "lucide-react";
import type { ToolDefinition } from "../data/tools.registry";
import { useRoster } from "../providers/RosterProvider";
import { useSettings } from "../providers/SettingsProvider";
import { ExportButton, GenericTool, RosterGate, TemplateManager } from "./shared";
import { Countdown, FlowBoard, StationRotation, StopwatchTool, TrafficLight, WorkSymbols } from "./tools/flowOrder/index";
import { AttendanceBoard, DiscussionTracker, GroupMaker, RandomPicker, RoleAssigner, RosterCenter, SeatingChart } from "./tools/rosterGroup/index";
import { ExitTicket, ParticipationTracker, QrBoard, QuickPoll, RubricBoard, Scoreboard, TaskChecklist } from "./tools/assessment/index";
import { ClozeTool, Flashcards, SentenceScramble, StoryDice, TextAnnotator, WordSearchTool } from "./tools/language/index";
import { CardSort, ConceptMap, TimelineTool, WhiteboardTool } from "./tools/visual/index";
import { FractionTiles, NumberCoordinate, UnitFormula } from "./tools/mathScience/index";

export const renderedToolIds = [
  "flow-board",
  "countdown",
  "station-rotation",
  "stopwatch",
  "traffic-light",
  "work-symbols",
  "roster-center",
  "seating-chart",
  "attendance-board",
  "random-picker",
  "discussion-tracker",
  "group-maker",
  "role-assigner",
  "quick-poll",
  "exit-ticket",
  "rubric-board",
  "qr-board",
  "scoreboard",
  "participation-tracker",
  "task-checklist",
  "flashcards",
  "cloze",
  "sentence-scramble",
  "word-search",
  "text-annotator",
  "story-dice",
  "whiteboard",
  "card-sort",
  "concept-map",
  "timeline",
  "number-coordinate",
  "fraction-tiles",
  "unit-formula"
] as const;

export function ToolWorkspace({
  definition,
  toolState,
  updateToolState,
  onBack,
  onOpenTool,
  onFavorite,
  isFavorite
}: {
  definition: ToolDefinition;
  toolState: Record<string, unknown>;
  updateToolState: <T>(toolId: string, value: T) => void;
  onBack: () => void;
  onOpenTool: (toolId: string) => void;
  onFavorite: () => void;
  isFavorite: boolean;
}) {
  const { settings, updateSettings } = useSettings();
  const state = toolState[definition.id];

  return (
    <section className="workspace">
      <div className="workspace-header">
        <button className="ghost-button" onClick={onBack}>
          <ArrowLeft size={16} />
          返回工具箱
        </button>
        <div className="workspace-title">
          <p>{definition.category} · {definition.stage.join(" / ")}</p>
          <h2>{definition.name}</h2>
        </div>
        <div className="workspace-actions">
          <button className={`icon-text ${isFavorite ? "active" : ""}`} onClick={onFavorite}>
            <Star size={17} />
            收藏
          </button>
          <button className="icon-text" onClick={() => updateSettings({ projectionMode: !settings.projectionMode })}>
            <Monitor size={17} />
            {settings.projectionMode ? "教師模式" : "投影模式"}
          </button>
        </div>
      </div>

      <div className="tool-layout">
        <section className="tool-main">
          <ToolRenderer definition={definition} state={state} setState={(value) => updateToolState(definition.id, value)} onOpenTool={onOpenTool} />
        </section>
        <aside className="tool-detail-panel">
          <h3>工具細節</h3>
          <p>{definition.detail}</p>
          <div className="detail-list">
            <strong>可客製化</strong>
            {definition.customizable.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="detail-list">
            <strong>輸出</strong>
            {definition.outputs.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="detail-list">
            <strong>適用</strong>
            {definition.subjects.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <TemplateManager toolId={definition.id} state={state} onApply={(nextState) => updateToolState(definition.id, nextState)} />
          {definition.canExport && (
            <ExportButton
              filename={`${definition.id}-state.json`}
              data={{ toolId: definition.id, name: definition.name, exportedAt: new Date().toISOString(), state: state ?? null }}
            />
          )}
        </aside>
      </div>
    </section>
  );
}

function ToolRenderer({ definition, state, setState, onOpenTool }: { definition: ToolDefinition; state: unknown; setState: (value: unknown) => void; onOpenTool: (toolId: string) => void }) {
  const { roster } = useRoster();
  if (definition.needsRoster && roster.length === 0) {
    return <RosterGate toolName={definition.name} onOpenRoster={() => onOpenTool("roster-center")} />;
  }

  switch (definition.id) {
    case "flow-board":
      return <FlowBoard state={state} setState={setState} />;
    case "countdown":
      return <Countdown state={state} setState={setState} visual={false} />;
    case "station-rotation":
      return <StationRotation state={state} setState={setState} />;
    case "stopwatch":
      return <StopwatchTool state={state} setState={setState} />;
    case "traffic-light":
      return <TrafficLight state={state} setState={setState} />;
    case "work-symbols":
      return <WorkSymbols state={state} setState={setState} />;
    case "roster-center":
      return <RosterCenter />;
    case "seating-chart":
      return <SeatingChart state={state} setState={setState} />;
    case "attendance-board":
      return <AttendanceBoard state={state} setState={setState} />;
    case "random-picker":
      return <RandomPicker state={state} setState={setState} />;
    case "discussion-tracker":
      return <DiscussionTracker state={state} setState={setState} />;
    case "group-maker":
      return <GroupMaker state={state} setState={setState} />;
    case "role-assigner":
      return <RoleAssigner state={state} setState={setState} />;
    case "quick-poll":
      return <QuickPoll state={state} setState={setState} />;
    case "exit-ticket":
      return <ExitTicket state={state} setState={setState} />;
    case "rubric-board":
      return <RubricBoard state={state} setState={setState} />;
    case "qr-board":
      return <QrBoard state={state} setState={setState} />;
    case "scoreboard":
      return <Scoreboard state={state} setState={setState} />;
    case "participation-tracker":
      return <ParticipationTracker state={state} setState={setState} />;
    case "task-checklist":
      return <TaskChecklist state={state} setState={setState} />;
    case "flashcards":
      return <Flashcards state={state} setState={setState} />;
    case "cloze":
      return <ClozeTool state={state} setState={setState} />;
    case "sentence-scramble":
      return <SentenceScramble state={state} setState={setState} />;
    case "word-search":
      return <WordSearchTool state={state} setState={setState} />;
    case "text-annotator":
      return <TextAnnotator state={state} setState={setState} />;
    case "story-dice":
      return <StoryDice state={state} setState={setState} />;
    case "whiteboard":
      return <WhiteboardTool state={state} setState={setState} />;
    case "card-sort":
      return <CardSort state={state} setState={setState} />;
    case "concept-map":
      return <ConceptMap state={state} setState={setState} />;
    case "timeline":
      return <TimelineTool state={state} setState={setState} />;
    case "number-coordinate":
      return <NumberCoordinate state={state} setState={setState} />;
    case "fraction-tiles":
      return <FractionTiles state={state} setState={setState} />;
    case "unit-formula":
      return <UnitFormula state={state} setState={setState} />;
    default:
      return <GenericTool definition={definition} state={state} setState={setState} />;
  }
}
