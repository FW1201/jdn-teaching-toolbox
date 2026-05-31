import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ComponentType, DragEvent, PointerEvent, ReactNode } from "react";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  CircleDot,
  Clock,
  Copy,
  Download,
  Eraser,
  ExternalLink,
  Eye,
  EyeOff,
  FileJson,
  Filter,
  Grid3X3,
  Layers,
  ListChecks,
  Monitor,
  Moon,
  Move,
  Palette,
  Play,
  Plus,
  Printer,
  QrCode,
  RotateCcw,
  Save,
  Search,
  Settings,
  Shuffle,
  Sparkles,
  Star,
  Timer,
  Trash2,
  Users,
  Wand2
} from "lucide-react";
import QRCode from "qrcode";
import { toPng } from "html-to-image";
import { extensions } from "./data/extensions";
import { gems } from "./data/gems";
import { lessonStages, toolCategories, toolsRegistry } from "./data/tools.registry";
import type { LessonStage, ToolCategory, ToolDefinition } from "./data/tools.registry";
import { createBackup } from "./lib/storage";
import {
  buildGroups,
  copyToClipboard,
  createBingoCards,
  createSeatingCells,
  createWordSearch,
  groupsToCsv,
  parseRoster,
  rosterToCsv,
  shuffle,
  textLines
} from "./lib/toolLogic";
import type { GroupResult, SeatingCell, Student, ToolboxBackup } from "./lib/types";
import { useExport } from "./providers/ExportProvider";
import { useRoster } from "./providers/RosterProvider";
import { useSettings } from "./providers/SettingsProvider";

type Section = "tools" | "gems" | "extensions" | "settings";

interface AppProps {
  initialToolState: Record<string, unknown>;
  onToolStateChange: (state: Record<string, unknown>) => void;
  onResetAll: () => void;
  onRestoreBackup: (backup: ToolboxBackup) => void;
}

interface FilterState {
  query: string;
  category: "全部" | ToolCategory;
  stage: "全部" | LessonStage;
  roster: "全部" | "需名單" | "不需名單";
  exportable: "全部" | "可匯出" | "僅投影";
  subject: string;
}

const defaultFilter: FilterState = {
  query: "",
  category: "全部",
  stage: "全部",
  roster: "全部",
  exportable: "全部",
  subject: "全部"
};

const categoryIcons: Record<ToolCategory, ComponentType<{ size?: number }>> = {
  流程與秩序: Timer,
  名單與分組: Users,
  互動評量: BarChart3,
  語文活動: BookOpen,
  視覺整理: Layers,
  數學與科學: CircleDot
};

export function App({ initialToolState, onToolStateChange, onResetAll, onRestoreBackup }: AppProps) {
  const { roster } = useRoster();
  const { settings, updateSettings } = useSettings();
  const { downloadJson } = useExport();
  const [toolState, setToolState] = useState<Record<string, unknown>>(initialToolState);
  const [section, setSection] = useState<Section>("tools");
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterState>(defaultFilter);

  useEffect(() => {
    document.documentElement.style.setProperty("--font-scale", String(settings.fontScale));
    document.body.classList.toggle("projection-mode", settings.projectionMode);
    document.body.classList.toggle("reduce-motion", settings.reduceMotion);
  }, [settings.fontScale, settings.projectionMode, settings.reduceMotion]);

  const subjects = useMemo(() => ["全部", ...Array.from(new Set(toolsRegistry.flatMap((tool) => tool.subjects))).sort()], []);
  const activeTool = useMemo(() => toolsRegistry.find((tool) => tool.id === activeToolId) ?? null, [activeToolId]);

  const filteredTools = useMemo(() => {
    const query = filter.query.trim().toLowerCase();
    return toolsRegistry.filter((tool) => {
      const matchesQuery =
        !query ||
        [tool.name, tool.summary, tool.detail, tool.category, ...tool.tags, ...tool.subjects, ...tool.grades]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesCategory = filter.category === "全部" || tool.category === filter.category;
      const matchesStage = filter.stage === "全部" || tool.stage.includes(filter.stage);
      const matchesRoster = filter.roster === "全部" || (filter.roster === "需名單" ? tool.needsRoster : !tool.needsRoster);
      const matchesExport = filter.exportable === "全部" || (filter.exportable === "可匯出" ? tool.canExport : tool.projectionReady);
      const matchesSubject = filter.subject === "全部" || tool.subjects.includes(filter.subject);
      return matchesQuery && matchesCategory && matchesStage && matchesRoster && matchesExport && matchesSubject;
    });
  }, [filter]);

  function updateToolState<T>(toolId: string, value: T) {
    setToolState((current) => {
      const next = { ...current, [toolId]: value };
      onToolStateChange(next);
      return next;
    });
  }

  function openTool(toolId: string) {
    setActiveToolId(toolId);
    const recentToolIds = [toolId, ...settings.recentToolIds.filter((id) => id !== toolId)].slice(0, 12);
    updateSettings({ recentToolIds });
  }

  function toggleFavorite(toolId: string) {
    const exists = settings.favoriteToolIds.includes(toolId);
    updateSettings({
      favoriteToolIds: exists ? settings.favoriteToolIds.filter((id) => id !== toolId) : [toolId, ...settings.favoriteToolIds]
    });
  }

  function exportBackup() {
    downloadJson("jdn-teaching-toolbox-backup.json", createBackup(roster, settings, toolState));
  }

  return (
    <div className="app-shell">
      <Sidebar section={section} setSection={setSection} totalTools={toolsRegistry.length} />
      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Journal of Digital Narrative</p>
            <h1>數位敘事力教學工具箱</h1>
          </div>
          <div className="top-actions">
            <button className="icon-text" onClick={() => updateSettings({ projectionMode: !settings.projectionMode })}>
              {settings.projectionMode ? <EyeOff size={18} /> : <Monitor size={18} />}
              {settings.projectionMode ? "教師模式" : "投影模式"}
            </button>
            <button className="icon-text" onClick={exportBackup}>
              <FileJson size={18} />
              備份
            </button>
          </div>
        </header>

        {section === "tools" && !activeTool && (
          <>
            <ToolsToolbar filter={filter} setFilter={setFilter} subjects={subjects} />
            <section className="content-grid">
              <CategoryRail filter={filter} setFilter={setFilter} />
              <div className="tool-results">
                <div className="result-heading">
                  <div>
                    <h2>課堂工具</h2>
                    <p>{filteredTools.length} / {toolsRegistry.length} 個自建工具，全部在本站內操作。</p>
                  </div>
                  <button className="ghost-button" onClick={() => setFilter(defaultFilter)}>
                    <RotateCcw size={16} />
                    重設篩選
                  </button>
                </div>
                <div className="tool-card-grid">
                  {filteredTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      isFavorite={settings.favoriteToolIds.includes(tool.id)}
                      isRecent={settings.recentToolIds.includes(tool.id)}
                      onOpen={() => openTool(tool.id)}
                      onFavorite={() => toggleFavorite(tool.id)}
                    />
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {section === "tools" && activeTool && (
          <ToolWorkspace
            definition={activeTool}
            toolState={toolState}
            updateToolState={updateToolState}
            onBack={() => setActiveToolId(null)}
            onFavorite={() => toggleFavorite(activeTool.id)}
            isFavorite={settings.favoriteToolIds.includes(activeTool.id)}
          />
        )}

        {section === "gems" && <GemsPage />}
        {section === "extensions" && <ExtensionsPage />}
        {section === "settings" && <SettingsPage toolState={toolState} onResetAll={onResetAll} onRestoreBackup={onRestoreBackup} />}
      </main>
    </div>
  );
}

function Sidebar({ section, setSection, totalTools }: { section: Section; setSection: (section: Section) => void; totalTools: number }) {
  const items: Array<{ id: Section; label: string; icon: ComponentType<{ size?: number }>; meta: string }> = [
    { id: "tools", label: "課堂工具", icon: Grid3X3, meta: `${totalTools} 個` },
    { id: "gems", label: "Gems 資源", icon: Sparkles, meta: "AI/Gemini" },
    { id: "extensions", label: "Chrome 擴充功能", icon: ExternalLink, meta: "CWS" },
    { id: "settings", label: "我的設定", icon: Settings, meta: "本機資料" }
  ];
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">JDN</div>
        <div>
          <strong>Teaching Toolbox</strong>
          <span>自有課堂工具</span>
        </div>
      </div>
      <nav className="side-nav">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => setSection(item.id)}>
              <Icon size={19} />
              <span>{item.label}</span>
              <small>{item.meta}</small>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function ToolsToolbar({ filter, setFilter, subjects }: { filter: FilterState; setFilter: (filter: FilterState) => void; subjects: string[] }) {
  return (
    <section className="toolbar">
      <label className="search-box">
        <Search size={18} />
        <input
          value={filter.query}
          onChange={(event) => setFilter({ ...filter, query: event.target.value })}
          placeholder="搜尋工具、標籤、科目、課堂階段..."
        />
      </label>
      <div className="filter-strip">
        <SelectPill icon={Filter} label="階段" value={filter.stage} options={["全部", ...lessonStages]} onChange={(value) => setFilter({ ...filter, stage: value as FilterState["stage"] })} />
        <SelectPill icon={Users} label="名單" value={filter.roster} options={["全部", "需名單", "不需名單"]} onChange={(value) => setFilter({ ...filter, roster: value as FilterState["roster"] })} />
        <SelectPill icon={Download} label="匯出" value={filter.exportable} options={["全部", "可匯出", "僅投影"]} onChange={(value) => setFilter({ ...filter, exportable: value as FilterState["exportable"] })} />
        <SelectPill icon={BookOpen} label="科目" value={filter.subject} options={subjects} onChange={(value) => setFilter({ ...filter, subject: value })} />
      </div>
    </section>
  );
}

function SelectPill({ icon: Icon, label, value, options, onChange }: { icon: ComponentType<{ size?: number }>; label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="select-pill">
      <Icon size={15} />
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function CategoryRail({ filter, setFilter }: { filter: FilterState; setFilter: (filter: FilterState) => void }) {
  return (
    <aside className="category-rail">
      <button className={filter.category === "全部" ? "active" : ""} onClick={() => setFilter({ ...filter, category: "全部" })}>
        <Grid3X3 size={18} />
        全部
      </button>
      {toolCategories.map((category) => {
        const Icon = categoryIcons[category];
        return (
          <button key={category} className={filter.category === category ? "active" : ""} onClick={() => setFilter({ ...filter, category })}>
            <Icon size={18} />
            {category}
          </button>
        );
      })}
    </aside>
  );
}

function ToolCard({ tool, isFavorite, isRecent, onOpen, onFavorite }: { tool: ToolDefinition; isFavorite: boolean; isRecent: boolean; onOpen: () => void; onFavorite: () => void }) {
  const Icon = categoryIcons[tool.category];
  return (
    <article className="tool-card">
      <div className="tool-card-top">
        <div className="tool-icon">
          <Icon size={24} />
        </div>
        <button className={`star-button ${isFavorite ? "active" : ""}`} onClick={onFavorite} aria-label="收藏工具">
          <Star size={18} />
        </button>
      </div>
      <div className="tool-card-copy">
        <h3>{tool.name}</h3>
        <p>{tool.summary}</p>
      </div>
      <div className="meta-row">
        <span>{tool.category}</span>
        <span>{tool.stage[0]}</span>
        {tool.needsRoster && <span>需名單</span>}
        {tool.canExport && <span>可匯出</span>}
        {isRecent && <span>最近使用</span>}
      </div>
      <button className="primary-button" onClick={onOpen}>
        開啟工具
        <ChevronRight size={17} />
      </button>
    </article>
  );
}

function ToolWorkspace({
  definition,
  toolState,
  updateToolState,
  onBack,
  onFavorite,
  isFavorite
}: {
  definition: ToolDefinition;
  toolState: Record<string, unknown>;
  updateToolState: <T>(toolId: string, value: T) => void;
  onBack: () => void;
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
          <ToolRenderer definition={definition} state={state} setState={(value) => updateToolState(definition.id, value)} />
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
        </aside>
      </div>
    </section>
  );
}

function ToolRenderer({ definition, state, setState }: { definition: ToolDefinition; state: unknown; setState: (value: unknown) => void }) {
  switch (definition.id) {
    case "flow-board":
      return <FlowBoard state={state} setState={setState} />;
    case "countdown":
      return <Countdown state={state} setState={setState} visual={false} />;
    case "visual-timer":
      return <Countdown state={state} setState={setState} visual />;
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
    case "seat-constraints":
      return <SeatConstraints state={state} setState={setState} />;
    case "random-picker":
      return <RandomPicker state={state} setState={setState} />;
    case "wheel":
      return <WheelTool state={state} setState={setState} />;
    case "group-maker":
      return <GroupMaker state={state} setState={setState} />;
    case "role-assigner":
      return <RoleAssigner state={state} setState={setState} />;
    case "quick-poll":
      return <QuickPoll state={state} setState={setState} />;
    case "exit-ticket":
      return <ExitTicket state={state} setState={setState} />;
    case "understanding-meter":
      return <UnderstandingMeter state={state} setState={setState} />;
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
    case "bingo":
      return <BingoTool state={state} setState={setState} />;
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

function mergeState<T extends object>(state: unknown, fallback: T): T {
  return { ...fallback, ...(state && typeof state === "object" ? (state as Partial<T>) : {}) };
}

async function exportElementAsPng(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;
  const url = await toPng(element, { pixelRatio: 2, backgroundColor: "#0d1117" });
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();
}

function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h3>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 5 }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; rows?: number }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function InputField({ label, value, onChange, type = "text", min }: { label: string; value: string | number; onChange: (value: string) => void; type?: string; min?: number }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} type={type} min={min} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function FlowBoard({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const { downloadJson } = useExport();
  const value = mergeState(state, {
    title: "今日國語課",
    items: [
      { id: "1", label: "暖身回顧", minutes: 5, materials: "投影片", done: false },
      { id: "2", label: "小組討論", minutes: 15, materials: "學習單", done: false },
      { id: "3", label: "全班整理", minutes: 10, materials: "白板", done: false }
    ]
  });

  function update(next: typeof value) {
    setState(next);
  }

  function move(index: number, direction: -1 | 1) {
    const items = [...value.items];
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    update({ ...value, items });
  }

  const total = value.items.reduce((sum, item) => sum + Number(item.minutes || 0), 0);
  const current = value.items.find((item) => !item.done) ?? value.items[value.items.length - 1];

  return (
    <div className="tool-grid">
      <Panel
        title="設定流程"
        action={
          <button className="ghost-button" onClick={() => downloadJson("flow-board-template.json", value)}>
            <Save size={16} />
            儲存模板
          </button>
        }
      >
        <InputField label="課堂標題" value={value.title} onChange={(title) => update({ ...value, title })} />
        <div className="list-editor">
          {value.items.map((item, index) => (
            <div className="list-row" key={item.id}>
              <input value={item.label} onChange={(event) => update({ ...value, items: value.items.map((entry) => (entry.id === item.id ? { ...entry, label: event.target.value } : entry)) })} />
              <input className="short-input" type="number" min={1} value={item.minutes} onChange={(event) => update({ ...value, items: value.items.map((entry) => (entry.id === item.id ? { ...entry, minutes: Number(event.target.value) } : entry)) })} />
              <input value={item.materials} onChange={(event) => update({ ...value, items: value.items.map((entry) => (entry.id === item.id ? { ...entry, materials: event.target.value } : entry)) })} />
              <button className="icon-only" onClick={() => move(index, -1)}><Move size={16} /></button>
              <button className="icon-only" onClick={() => update({ ...value, items: value.items.filter((entry) => entry.id !== item.id) })}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <button className="secondary-button" onClick={() => update({ ...value, items: [...value.items, { id: crypto.randomUUID(), label: "新步驟", minutes: 5, materials: "", done: false }] })}>
          <Plus size={16} />
          新增步驟
        </button>
      </Panel>
      <Panel title="投影流程">
        <div className="projection-card" id="flow-board-export">
          <p className="eyebrow">{value.title} · 共 {total} 分鐘</p>
          <h2>{current?.label ?? "流程完成"}</h2>
          <div className="flow-list">
            {value.items.map((item, index) => (
              <button key={item.id} className={item.done ? "flow-item done" : "flow-item"} onClick={() => update({ ...value, items: value.items.map((entry) => (entry.id === item.id ? { ...entry, done: !entry.done } : entry)) })}>
                <span>{index + 1}</span>
                <strong>{item.label}</strong>
                <small>{item.minutes} 分 · {item.materials || "無材料"}</small>
              </button>
            ))}
          </div>
        </div>
        <button className="secondary-button" onClick={() => exportElementAsPng("flow-board-export", "flow-board.png")}>
          <Download size={16} />
          匯出 PNG
        </button>
      </Panel>
    </div>
  );
}

function Countdown({ state, setState, visual }: { state: unknown; setState: (value: unknown) => void; visual: boolean }) {
  const value = mergeState(state, { minutes: visual ? 8 : 5, secondsLeft: (visual ? 8 : 5) * 60, running: false, message: visual ? "輪站活動" : "時間到", silent: true });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!value.running || value.secondsLeft <= 0) return undefined;
    const id = window.setInterval(() => {
      setState({ ...value, secondsLeft: Math.max(0, value.secondsLeft - 1), running: value.secondsLeft - 1 > 0 });
      setTick((current) => current + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [setState, tick, value]);

  const total = Math.max(1, value.minutes * 60);
  const progress = Math.max(0, Math.min(100, (value.secondsLeft / total) * 100));
  const mm = String(Math.floor(value.secondsLeft / 60)).padStart(2, "0");
  const ss = String(value.secondsLeft % 60).padStart(2, "0");

  function reset(minutes = value.minutes) {
    setState({ ...value, minutes, secondsLeft: minutes * 60, running: false });
  }

  return (
    <div className="tool-grid">
      <Panel title="計時設定">
        <div className="quick-buttons">
          {[1, 3, 5, 10, 15].map((minute) => (
            <button key={minute} className={value.minutes === minute ? "active" : ""} onClick={() => reset(minute)}>
              {minute} 分
            </button>
          ))}
        </div>
        <InputField label="自訂分鐘" type="number" min={1} value={value.minutes} onChange={(minutes) => reset(Number(minutes || 1))} />
        <InputField label="提示文字" value={value.message} onChange={(message) => setState({ ...value, message })} />
        <label className="toggle-row">
          <input type="checkbox" checked={value.silent} onChange={(event) => setState({ ...value, silent: event.target.checked })} />
          無聲模式
        </label>
      </Panel>
      <Panel title={visual ? "視覺計時" : "倒數投影"}>
        <div className={visual ? "timer-display visual" : "timer-display"}>
          {visual ? (
            <div className="timer-ring" style={{ "--progress": `${progress}%` } as CSSProperties}>
              <span>{mm}:{ss}</span>
            </div>
          ) : (
            <strong>{mm}:{ss}</strong>
          )}
          <p>{value.secondsLeft === 0 ? value.message : "剩餘時間"}</p>
          <div className="progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="action-row">
          <button className="primary-button" onClick={() => setState({ ...value, running: !value.running })}>
            <Play size={16} />
            {value.running ? "暫停" : "開始"}
          </button>
          <button className="secondary-button" onClick={() => reset()}>
            <RotateCcw size={16} />
            重設
          </button>
          {!value.silent && value.secondsLeft === 0 && <Bell size={22} className="bell" />}
        </div>
      </Panel>
    </div>
  );
}

function StopwatchTool({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const value = mergeState(state, { elapsed: 0, running: false, laps: [] as Array<{ id: string; label: string; time: number }> });
  const [tick, setTick] = useState(0);
  const { downloadText } = useExport();

  useEffect(() => {
    if (!value.running) return undefined;
    const id = window.setInterval(() => {
      setState({ ...value, elapsed: value.elapsed + 1 });
      setTick((current) => current + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [setState, tick, value]);

  const time = formatSeconds(value.elapsed);
  const output = value.laps.map((lap, index) => `${index + 1}. ${lap.label}: ${formatSeconds(lap.time)}`).join("\n");

  return (
    <div className="tool-grid">
      <Panel title="正向計時">
        <div className="stopwatch-display">{time}</div>
        <div className="action-row">
          <button className="primary-button" onClick={() => setState({ ...value, running: !value.running })}>{value.running ? "暫停" : "開始"}</button>
          <button className="secondary-button" onClick={() => setState({ ...value, elapsed: 0, running: false, laps: [] })}>重設</button>
          <button className="secondary-button" onClick={() => setState({ ...value, laps: [...value.laps, { id: crypto.randomUUID(), label: `分段 ${value.laps.length + 1}`, time: value.elapsed }] })}>分段</button>
        </div>
      </Panel>
      <Panel
        title="分段紀錄"
        action={<button className="ghost-button" onClick={() => downloadText("stopwatch-laps.txt", output)}><Download size={16} />匯出</button>}
      >
        <div className="result-list">
          {value.laps.map((lap, index) => (
            <div key={lap.id} className="result-row">
              <span>{index + 1}</span>
              <input value={lap.label} onChange={(event) => setState({ ...value, laps: value.laps.map((entry) => (entry.id === lap.id ? { ...entry, label: event.target.value } : entry)) })} />
              <strong>{formatSeconds(lap.time)}</strong>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function TrafficLight({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const value = mergeState(state, {
    active: "green",
    rules: {
      green: "可以小聲討論，完成後舉手。",
      yellow: "降低音量，回到座位完成任務。",
      red: "停止說話，看向教師。"
    }
  });
  const colors = [
    { id: "green", label: "綠燈", className: "green" },
    { id: "yellow", label: "黃燈", className: "yellow" },
    { id: "red", label: "紅燈", className: "red" }
  ];

  return (
    <div className="tool-grid">
      <Panel title="規則文字">
        {colors.map((color) => (
          <InputField key={color.id} label={color.label} value={value.rules[color.id as keyof typeof value.rules]} onChange={(text) => setState({ ...value, rules: { ...value.rules, [color.id]: text } })} />
        ))}
      </Panel>
      <Panel title="投影狀態">
        <div className="traffic-display">
          {colors.map((color) => (
            <button key={color.id} className={`traffic-dot ${color.className} ${value.active === color.id ? "active" : ""}`} onClick={() => setState({ ...value, active: color.id })}>
              {color.label}
            </button>
          ))}
        </div>
        <div className={`status-banner ${value.active}`}>
          <strong>{colors.find((color) => color.id === value.active)?.label}</strong>
          <p>{value.rules[value.active as keyof typeof value.rules]}</p>
        </div>
      </Panel>
    </div>
  );
}

function WorkSymbols({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const value = mergeState(state, {
    active: "silent",
    modes: [
      { id: "silent", label: "安靜獨立", hint: "自己完成，不交談", symbol: "Moon" },
      { id: "pair", label: "兩人討論", hint: "與隔壁同學交換想法", symbol: "Users" },
      { id: "group", label: "小組合作", hint: "分工並完成共同任務", symbol: "Layers" },
      { id: "teacher", label: "可問老師", hint: "先問組員，再問老師", symbol: "Bell" }
    ]
  });
  const iconMap: Record<string, ComponentType<{ size?: number }>> = { Moon, Users, Layers, Bell };

  return (
    <div className="tool-grid">
      <Panel title="模式設定">
        <div className="list-editor">
          {value.modes.map((mode) => (
            <div className="list-row" key={mode.id}>
              <input value={mode.label} onChange={(event) => setState({ ...value, modes: value.modes.map((entry) => (entry.id === mode.id ? { ...entry, label: event.target.value } : entry)) })} />
              <input value={mode.hint} onChange={(event) => setState({ ...value, modes: value.modes.map((entry) => (entry.id === mode.id ? { ...entry, hint: event.target.value } : entry)) })} />
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="投影符號">
        <div className="symbol-grid">
          {value.modes.map((mode) => {
            const Icon = iconMap[mode.symbol] ?? CircleDot;
            return (
              <button key={mode.id} className={value.active === mode.id ? "symbol-card active" : "symbol-card"} onClick={() => setState({ ...value, active: mode.id })}>
                <Icon size={48} />
                <strong>{mode.label}</strong>
                <span>{mode.hint}</span>
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function RosterCenter() {
  const { roster, setRoster } = useRoster();
  const { downloadText } = useExport();
  const [input, setInput] = useState("1,王小明,男,需要前排\n2,陳小華,女,\n3,林小安,女,可協助同學");

  return (
    <div className="tool-grid">
      <Panel title="匯入名單">
        <TextAreaField label="貼上 CSV 或表格" rows={8} value={input} onChange={setInput} placeholder="座號,姓名,性別,備註" />
        <div className="action-row">
          <button className="primary-button" onClick={() => setRoster(parseRoster(input))}>
            <Users size={16} />
            匯入 {textLines(input).length} 筆
          </button>
          <button className="secondary-button" onClick={() => downloadText("class-roster.csv", rosterToCsv(roster), "text/csv;charset=utf-8")}>
            <Download size={16} />
            匯出 CSV
          </button>
        </div>
      </Panel>
      <Panel title={`目前名單 ${roster.length} 人`}>
        <div className="table-like">
          <div className="table-head"><span>座號</span><span>姓名</span><span>性別</span><span>備註</span></div>
          {roster.map((student) => (
            <div key={student.id} className="table-row">
              <span>{student.seatNo}</span>
              <span>{student.name}</span>
              <span>{student.gender}</span>
              <span>{student.note}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function SeatingChart({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const { roster } = useRoster();
  const { downloadText } = useExport();
  const value = mergeState(state, { rows: 5, cols: 6, teacherSide: "上方講台", cells: [] as SeatingCell[] });
  const cells = value.cells.length ? value.cells : createSeatingCells(value.rows, value.cols, roster, "seatNo");

  function update(next: typeof value) {
    setState(next);
  }

  function arrange(mode: "random" | "seatNo") {
    update({ ...value, cells: createSeatingCells(value.rows, value.cols, roster, mode) });
  }

  const studentMap = new Map(roster.map((student) => [student.id, student]));
  const csv = cells.map((cell) => {
    const student = cell.studentId ? studentMap.get(cell.studentId) : undefined;
    return [cell.row + 1, cell.col + 1, student?.seatNo ?? "", student?.name ?? ""].join(",");
  }).join("\n");

  return (
    <div className="tool-grid">
      <Panel title="座位設定">
        <div className="two-col">
          <InputField label="列" type="number" min={1} value={value.rows} onChange={(rows) => update({ ...value, rows: Number(rows), cells: [] })} />
          <InputField label="欄" type="number" min={1} value={value.cols} onChange={(cols) => update({ ...value, cols: Number(cols), cells: [] })} />
        </div>
        <InputField label="講台標示" value={value.teacherSide} onChange={(teacherSide) => update({ ...value, teacherSide })} />
        <div className="action-row">
          <button className="primary-button" onClick={() => arrange("random")}><Shuffle size={16} />隨機排</button>
          <button className="secondary-button" onClick={() => arrange("seatNo")}>座號排</button>
        </div>
      </Panel>
      <Panel
        title="座位表"
        action={
          <>
            <button className="ghost-button" onClick={() => downloadText("seating-chart.csv", `列,欄,座號,姓名\n${csv}`, "text/csv;charset=utf-8")}><Download size={16} />CSV</button>
            <button className="ghost-button" onClick={() => exportElementAsPng("seating-export", "seating-chart.png")}><Printer size={16} />PNG</button>
          </>
        }
      >
        <div className="seating-board" id="seating-export" style={{ gridTemplateColumns: `repeat(${value.cols}, minmax(88px, 1fr))` }}>
          <div className="teacher-desk" style={{ gridColumn: `1 / span ${value.cols}` }}>{value.teacherSide}</div>
          {cells.map((cell) => {
            const student = cell.studentId ? studentMap.get(cell.studentId) : undefined;
            return (
              <button key={cell.id} className={cell.empty ? "seat empty" : "seat"} onClick={() => update({ ...value, cells: cells.map((entry) => (entry.id === cell.id ? { ...entry, empty: !entry.empty, studentId: entry.empty ? entry.studentId : undefined } : entry)) })}>
                <span>{cell.row + 1}-{cell.col + 1}</span>
                <strong>{student?.name ?? "空位"}</strong>
                <small>{student?.seatNo ?? ""}</small>
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function SeatConstraints({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const { roster } = useRoster();
  const value = mergeState(state, { apart: "", front: "", back: "" });
  const apartNames = textLines(value.apart).map((line) => line.split(/,|、|\s+/).filter(Boolean));
  const conflicts = apartNames
    .filter((pair) => pair.length >= 2)
    .map((pair) => `${pair[0]} 與 ${pair[1]} 需分開`)
    .filter((text) => roster.some((student) => text.includes(student.name)));

  return (
    <div className="tool-grid">
      <Panel title="限制條件">
        <TextAreaField label="需分開（每行一組，可用逗號）" value={value.apart} onChange={(apart) => setState({ ...value, apart })} placeholder="王小明,陳小華" />
        <TextAreaField label="前排偏好" value={value.front} onChange={(front) => setState({ ...value, front })} placeholder="需要前排或視力提醒" />
        <TextAreaField label="後排偏好" value={value.back} onChange={(back) => setState({ ...value, back })} placeholder="可坐後排名單" />
      </Panel>
      <Panel title="檢查結果">
        <div className="result-list">
          {conflicts.length ? conflicts.map((conflict) => <div className="notice-row warning" key={conflict}>{conflict}</div>) : <div className="notice-row success">目前限制已記錄，可回到座位表重新排座。</div>}
          <div className="notice-row">前排：{textLines(value.front).join("、") || "未設定"}</div>
          <div className="notice-row">後排：{textLines(value.back).join("、") || "未設定"}</div>
        </div>
      </Panel>
    </div>
  );
}

function RandomPicker({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const { roster } = useRoster();
  const { downloadText } = useExport();
  const value = mergeState(state, { count: 1, exclude: true, pickedIds: [] as string[], history: [] as string[] });
  const available = roster.filter((student) => !value.exclude || !value.pickedIds.includes(student.id));

  function pick() {
    const selected = shuffle(available).slice(0, Math.max(1, value.count));
    setState({
      ...value,
      pickedIds: [...value.pickedIds, ...selected.map((student) => student.id)],
      history: [`${new Date().toLocaleTimeString()} ${selected.map((student) => student.name).join("、")}`, ...value.history]
    });
  }

  return (
    <div className="tool-grid">
      <Panel title="抽選設定">
        <InputField label="抽選人數" type="number" min={1} value={value.count} onChange={(count) => setState({ ...value, count: Number(count) })} />
        <label className="toggle-row"><input type="checkbox" checked={value.exclude} onChange={(event) => setState({ ...value, exclude: event.target.checked })} />排除已抽</label>
        <button className="primary-button" disabled={!available.length} onClick={pick}><Shuffle size={16} />開始抽選</button>
        <button className="secondary-button" onClick={() => setState({ ...value, pickedIds: [], history: [] })}>重設紀錄</button>
      </Panel>
      <Panel title="抽選結果" action={<button className="ghost-button" onClick={() => downloadText("random-picker.txt", value.history.join("\n"))}><Download size={16} />匯出</button>}>
        <div className="winner-display">{value.history[0] ?? "尚未抽選"}</div>
        <div className="result-list">{value.history.map((row) => <div key={row} className="result-row"><span>{row}</span></div>)}</div>
      </Panel>
    </div>
  );
}

function WheelTool({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const { roster } = useRoster();
  const value = mergeState(state, { source: "名單", itemsText: "朗讀第一段\n回答問題\n擔任記錄", remove: true, selected: "", rotation: 0 });
  const sourceItems = value.source === "名單" && roster.length ? roster.map((student) => student.name) : textLines(value.itemsText);
  const items = sourceItems.filter(Boolean);

  function spin() {
    if (!items.length) return;
    const selected = items[Math.floor(Math.random() * items.length)];
    const nextItems = value.remove ? items.filter((item) => item !== selected).join("\n") : value.itemsText;
    setState({ ...value, selected, rotation: value.rotation + 720 + Math.floor(Math.random() * 360), itemsText: value.source === "名單" ? value.itemsText : nextItems });
  }

  return (
    <div className="tool-grid">
      <Panel title="轉盤項目">
        <label className="field"><span>來源</span><select value={value.source} onChange={(event) => setState({ ...value, source: event.target.value })}><option>名單</option><option>自訂</option></select></label>
        <TextAreaField label="自訂項目" rows={8} value={value.itemsText} onChange={(itemsText) => setState({ ...value, itemsText })} />
        <label className="toggle-row"><input type="checkbox" checked={value.remove} onChange={(event) => setState({ ...value, remove: event.target.checked })} />抽出後移除</label>
      </Panel>
      <Panel title="投影轉盤">
        <div className="wheel" style={{ transform: `rotate(${value.rotation}deg)` }}>{items.slice(0, 12).map((item) => <span key={item}>{item}</span>)}</div>
        <button className="primary-button" onClick={spin}><Wand2 size={16} />旋轉</button>
        <div className="winner-display">{value.selected || "等待旋轉"}</div>
      </Panel>
    </div>
  );
}

function GroupMaker({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const { roster } = useRoster();
  const { downloadText } = useExport();
  const value = mergeState(state, { groupCount: 4, balanceGender: true, groups: [] as GroupResult[] });
  const groups = value.groups.length ? value.groups : buildGroups(roster, value.groupCount, value.balanceGender);

  function generate() {
    setState({ ...value, groups: buildGroups(roster, value.groupCount, value.balanceGender) });
  }

  return (
    <div className="tool-grid">
      <Panel title="分組設定">
        <InputField label="組數" type="number" min={1} value={value.groupCount} onChange={(groupCount) => setState({ ...value, groupCount: Number(groupCount), groups: [] })} />
        <label className="toggle-row"><input type="checkbox" checked={value.balanceGender} onChange={(event) => setState({ ...value, balanceGender: event.target.checked, groups: [] })} />嘗試性別平衡</label>
        <button className="primary-button" onClick={generate}><Shuffle size={16} />產生分組</button>
        <button className="secondary-button" onClick={() => downloadText("groups.csv", groupsToCsv(groups), "text/csv;charset=utf-8")}><Download size={16} />匯出 CSV</button>
      </Panel>
      <Panel title="分組表">
        <div className="group-grid">
          {groups.map((group) => (
            <div key={group.id} className="group-card">
              <h4>{group.name}</h4>
              {group.students.map((student) => <span key={student.id}>{student.seatNo} {student.name}</span>)}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function RoleAssigner({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const { roster } = useRoster();
  const { downloadText } = useExport();
  const value = mergeState(state, { roles: "主持\n記錄\n報告\n時間管理", groupCount: 4, assignments: [] as Array<{ group: string; student: string; role: string }> });
  const roles = textLines(value.roles);

  function assign() {
    const groups = buildGroups(roster, value.groupCount, false);
    const assignments = groups.flatMap((group) => group.students.map((student, index) => ({ group: group.name, student: student.name, role: roles[index % Math.max(1, roles.length)] ?? "成員" })));
    setState({ ...value, assignments });
  }

  const csv = ["組別,學生,角色", ...value.assignments.map((item) => [item.group, item.student, item.role].join(","))].join("\n");

  return (
    <div className="tool-grid">
      <Panel title="角色庫">
        <TextAreaField label="每行一個角色" value={value.roles} onChange={(rolesText) => setState({ ...value, roles: rolesText })} />
        <InputField label="組數" type="number" min={1} value={value.groupCount} onChange={(groupCount) => setState({ ...value, groupCount: Number(groupCount) })} />
        <button className="primary-button" onClick={assign}><Shuffle size={16} />分配角色</button>
      </Panel>
      <Panel title="角色表" action={<button className="ghost-button" onClick={() => downloadText("roles.csv", csv, "text/csv;charset=utf-8")}><Download size={16} />CSV</button>}>
        <div className="table-like compact">
          <div className="table-head"><span>組別</span><span>學生</span><span>角色</span></div>
          {value.assignments.map((item, index) => <div className="table-row" key={`${item.student}-${index}`}><span>{item.group}</span><span>{item.student}</span><strong>{item.role}</strong></div>)}
        </div>
      </Panel>
    </div>
  );
}

function QuickPoll({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const { downloadText } = useExport();
  const value = mergeState(state, { question: "你覺得今天最需要再複習的是？", options: ["概念", "例題", "操作", "合作"], votes: [0, 0, 0, 0] });
  const max = Math.max(1, ...value.votes);
  const csv = ["選項,票數", ...value.options.map((option, index) => `${option},${value.votes[index] ?? 0}`)].join("\n");

  function updateOption(index: number, option: string) {
    setState({ ...value, options: value.options.map((item, itemIndex) => (itemIndex === index ? option : item)) });
  }

  return (
    <div className="tool-grid">
      <Panel title="投票題目">
        <InputField label="題目" value={value.question} onChange={(question) => setState({ ...value, question })} />
        <div className="list-editor">
          {value.options.map((option, index) => (
            <div className="list-row" key={index}>
              <input value={option} onChange={(event) => updateOption(index, event.target.value)} />
              <button className="icon-only" onClick={() => setState({ ...value, options: value.options.filter((_, itemIndex) => itemIndex !== index), votes: value.votes.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <button className="secondary-button" onClick={() => setState({ ...value, options: [...value.options, `選項 ${value.options.length + 1}`], votes: [...value.votes, 0] })}><Plus size={16} />新增選項</button>
      </Panel>
      <Panel title="投影統計" action={<button className="ghost-button" onClick={() => downloadText("poll.csv", csv, "text/csv;charset=utf-8")}><Download size={16} />CSV</button>}>
        <div className="poll-card">
          <h3>{value.question}</h3>
          {value.options.map((option, index) => (
            <div className="poll-row" key={option}>
              <button onClick={() => setState({ ...value, votes: value.votes.map((vote, voteIndex) => (voteIndex === index ? vote + 1 : vote)) })}>+1</button>
              <span>{option}</span>
              <div className="bar"><i style={{ width: `${((value.votes[index] ?? 0) / max) * 100}%` }} /></div>
              <strong>{value.votes[index] ?? 0}</strong>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function ExitTicket({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const { downloadText } = useExport();
  const value = mergeState(state, { title: "課末三問", questions: ["今天我學到...", "我還不確定...", "下一步我想..."], notes: "" });
  const output = `${value.title}\n\n${value.questions.map((question, index) => `${index + 1}. ${question}`).join("\n")}\n\n教師紀錄：\n${value.notes}`;

  return (
    <div className="tool-grid">
      <Panel title="題目模板">
        <InputField label="標題" value={value.title} onChange={(title) => setState({ ...value, title })} />
        {value.questions.map((question, index) => <InputField key={index} label={`問題 ${index + 1}`} value={question} onChange={(text) => setState({ ...value, questions: value.questions.map((item, itemIndex) => (itemIndex === index ? text : item)) })} />)}
        <TextAreaField label="教師紀錄" value={value.notes} onChange={(notes) => setState({ ...value, notes })} />
      </Panel>
      <Panel title="投影題目" action={<button className="ghost-button" onClick={() => downloadText("exit-ticket.txt", output)}><Download size={16} />匯出</button>}>
        <div className="projection-card">
          <h2>{value.title}</h2>
          <ol className="big-list">{value.questions.map((question, index) => <li key={index}>{question}</li>)}</ol>
        </div>
      </Panel>
    </div>
  );
}

function UnderstandingMeter({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const { downloadText } = useExport();
  const value = mergeState(state, { counts: [0, 0, 0, 0, 0], labels: ["完全不懂", "有點模糊", "大致理解", "可以練習", "能教別人"], note: "" });
  const total = value.counts.reduce((sum, count) => sum + count, 0);
  const csv = ["分數,標籤,人數", ...value.labels.map((label, index) => `${index + 1},${label},${value.counts[index]}`)].join("\n");

  return (
    <div className="tool-grid">
      <Panel title="快速點選">
        <TextAreaField label="備註" rows={3} value={value.note} onChange={(note) => setState({ ...value, note })} />
        <button className="secondary-button" onClick={() => setState({ ...value, counts: [0, 0, 0, 0, 0] })}>清空統計</button>
      </Panel>
      <Panel title={`全班理解狀態 · ${total} 人次`} action={<button className="ghost-button" onClick={() => downloadText("understanding-meter.csv", csv, "text/csv;charset=utf-8")}><Download size={16} />CSV</button>}>
        <div className="meter-grid">
          {value.labels.map((label, index) => (
            <button key={label} className="meter-card" onClick={() => setState({ ...value, counts: value.counts.map((count, countIndex) => (countIndex === index ? count + 1 : count)) })}>
              <strong>{index + 1}</strong>
              <span>{label}</span>
              <em>{value.counts[index]}</em>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function QrBoard({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const value = mergeState(state, { title: "課堂連結", url: "https://", hint: "掃描後開啟連結，完成後回到座位。", qr: "", qrFor: "" });

  useEffect(() => {
    if (!value.url || value.url === "https://" || value.qrFor === value.url) return;
    QRCode.toDataURL(value.url, { margin: 1, width: 420, color: { dark: "#0d1117", light: "#ffffff" } }).then((qr) => setState({ ...value, qr, qrFor: value.url }));
  }, [setState, value]);

  return (
    <div className="tool-grid">
      <Panel title="連結設定">
        <InputField label="標題" value={value.title} onChange={(title) => setState({ ...value, title })} />
        <InputField label="URL" value={value.url} onChange={(url) => setState({ ...value, url })} />
        <InputField label="操作提示" value={value.hint} onChange={(hint) => setState({ ...value, hint })} />
      </Panel>
      <Panel title="投影 QR">
        <div className="qr-card">
          <h2>{value.title}</h2>
          {value.qr ? <img src={value.qr} alt="QR code" /> : <QrCode size={180} />}
          <p>{value.hint}</p>
          <button className="secondary-button" onClick={() => copyToClipboard(value.url)}><Copy size={16} />複製連結</button>
        </div>
      </Panel>
    </div>
  );
}

function Scoreboard({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const { downloadText } = useExport();
  const value = mergeState(state, { teamsText: "第一組\n第二組\n第三組\n第四組", scores: {} as Record<string, number>, history: [] as string[] });
  const teams = textLines(value.teamsText);

  function adjust(team: string, delta: number) {
    const score = (value.scores[team] ?? 0) + delta;
    setState({ ...value, scores: { ...value.scores, [team]: score }, history: [`${new Date().toLocaleTimeString()} ${team} ${delta > 0 ? "+" : ""}${delta}`, ...value.history] });
  }

  const ranking = [...teams].sort((a, b) => (value.scores[b] ?? 0) - (value.scores[a] ?? 0));
  const csv = ["隊伍,分數", ...ranking.map((team) => `${team},${value.scores[team] ?? 0}`)].join("\n");

  return (
    <div className="tool-grid">
      <Panel title="隊伍設定">
        <TextAreaField label="每行一隊" value={value.teamsText} onChange={(teamsText) => setState({ ...value, teamsText })} />
        <button className="secondary-button" onClick={() => setState({ ...value, scores: {}, history: [] })}>重設分數</button>
      </Panel>
      <Panel title="投影排名" action={<button className="ghost-button" onClick={() => downloadText("scoreboard.csv", csv, "text/csv;charset=utf-8")}><Download size={16} />CSV</button>}>
        <div className="score-list">
          {ranking.map((team, index) => (
            <div className="score-row" key={team}>
              <span>{index + 1}</span>
              <strong>{team}</strong>
              <button onClick={() => adjust(team, -1)}>-1</button>
              <em>{value.scores[team] ?? 0}</em>
              <button onClick={() => adjust(team, 1)}>+1</button>
              <button onClick={() => adjust(team, 5)}>+5</button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function ParticipationTracker({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const { roster } = useRoster();
  const { downloadText } = useExport();
  const value = mergeState(state, { eventType: "發言", counts: {} as Record<string, number>, history: [] as string[] });

  function record(student: Student) {
    setState({
      ...value,
      counts: { ...value.counts, [student.id]: (value.counts[student.id] ?? 0) + 1 },
      history: [`${new Date().toLocaleTimeString()},${student.seatNo},${student.name},${value.eventType}`, ...value.history]
    });
  }

  const sorted = [...roster].sort((a, b) => (value.counts[a.id] ?? 0) - (value.counts[b.id] ?? 0));

  return (
    <div className="tool-grid">
      <Panel title="事件紀錄">
        <InputField label="事件類型" value={value.eventType} onChange={(eventType) => setState({ ...value, eventType })} />
        <div className="student-button-grid">{roster.map((student) => <button key={student.id} onClick={() => record(student)}>{student.seatNo} {student.name}<span>{value.counts[student.id] ?? 0}</span></button>)}</div>
      </Panel>
      <Panel title="低參與提醒" action={<button className="ghost-button" onClick={() => downloadText("participation.csv", ["時間,座號,姓名,事件", ...value.history].join("\n"), "text/csv;charset=utf-8")}><Download size={16} />CSV</button>}>
        <div className="result-list">{sorted.slice(0, 8).map((student) => <div className="result-row" key={student.id}><span>{student.seatNo} {student.name}</span><strong>{value.counts[student.id] ?? 0}</strong></div>)}</div>
      </Panel>
    </div>
  );
}

function TaskChecklist({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
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
          {groups.flatMap((group) => [
            <strong key={`${group}-label`}>{group}</strong>,
            ...tasks.map((task) => {
              const key = `${group}:${task}`;
              return <button key={key} className={value.done[key] ? "checked" : ""} onClick={() => toggle(group, task)}>{value.done[key] ? <Check size={18} /> : ""}</button>;
            })
          ])}
        </div>
      </Panel>
    </div>
  );
}

function Flashcards({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const value = mergeState(state, { input: "民主,人民作主的政治制度\nphotosynthesis,光合作用\n敘事,把事件組織成有意義的表達", cards: [] as Array<{ front: string; back: string }>, index: 0, flipped: false });
  const cards = value.cards.length ? value.cards : textLines(value.input).map((line) => {
    const [front, ...rest] = line.split(/,|\t/);
    return { front: front ?? "", back: rest.join(" / ") };
  });
  const current = cards[value.index % Math.max(1, cards.length)];

  return (
    <div className="tool-grid">
      <Panel title="批次匯入">
        <TextAreaField label="正面,背面" rows={8} value={value.input} onChange={(input) => setState({ ...value, input, cards: [], index: 0 })} />
        <button className="secondary-button" onClick={() => setState({ ...value, cards: shuffle(cards), index: 0, flipped: false })}><Shuffle size={16} />洗牌</button>
      </Panel>
      <Panel title="投影字詞卡">
        <button className={value.flipped ? "flashcard flipped" : "flashcard"} onClick={() => setState({ ...value, flipped: !value.flipped })}>
          <span>{value.flipped ? "背面" : "正面"}</span>
          <strong>{value.flipped ? current?.back : current?.front}</strong>
        </button>
        <div className="action-row">
          <button className="secondary-button" onClick={() => setState({ ...value, index: Math.max(0, value.index - 1), flipped: false })}>上一張</button>
          <button className="primary-button" onClick={() => setState({ ...value, index: (value.index + 1) % Math.max(1, cards.length), flipped: false })}>下一張</button>
        </div>
      </Panel>
    </div>
  );
}

function ClozeTool({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const value = mergeState(state, { text: "數位敘事力是一種把資訊、媒體與故事結構整合的表達能力。", answers: "數位敘事力\n資訊\n故事結構", showAnswers: false });
  const answers = textLines(value.answers);
  const cloze = answers.reduce((content, answer, index) => content.replaceAll(answer, value.showAnswers ? `【${answer}】` : `____(${index + 1})____`), value.text);

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

function SentenceScramble({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const value = mergeState(state, { sentence: "學生 在 課堂 中 透過 討論 建構 理解", pieces: [] as string[] });
  const pieces = value.pieces.length ? value.pieces : shuffle(value.sentence.split(/\s+/).filter(Boolean));

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
      </Panel>
    </div>
  );
}

function WordSearchTool({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const value = mergeState(state, { words: "STORY\nMEDIA\nCLASS\nLEARN", size: 10, puzzle: null as null | ReturnType<typeof createWordSearch>, showAnswers: false });
  const puzzle = value.puzzle ?? createWordSearch(textLines(value.words), value.size);

  return (
    <div className="tool-grid">
      <Panel title="字詞表">
        <TextAreaField label="每行一個字詞" value={value.words} onChange={(words) => setState({ ...value, words, puzzle: null })} />
        <InputField label="方格大小" type="number" min={6} value={value.size} onChange={(size) => setState({ ...value, size: Number(size), puzzle: null })} />
        <button className="primary-button" onClick={() => setState({ ...value, puzzle: createWordSearch(textLines(value.words), value.size) })}>產生方格</button>
      </Panel>
      <Panel title="字詞搜尋">
        <div className="word-grid" style={{ gridTemplateColumns: `repeat(${value.size}, 1fr)` }}>{puzzle.grid.flatMap((row, rowIndex) => row.map((cell, colIndex) => <span key={`${rowIndex}-${colIndex}`}>{cell}</span>))}</div>
        <label className="toggle-row"><input type="checkbox" checked={value.showAnswers} onChange={(event) => setState({ ...value, puzzle, showAnswers: event.target.checked })} />顯示解答</label>
        {value.showAnswers && <div className="answer-list">{puzzle.placements.map((item) => <span key={item.word}>{item.word}: {item.row + 1},{item.col + 1} {item.dir}</span>)}</div>}
      </Panel>
    </div>
  );
}

function BingoTool({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
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
        <div className="bingo-list">{cards.map((card, cardIndex) => <div key={cardIndex} className="bingo-card" style={{ gridTemplateColumns: `repeat(${value.size}, 1fr)` }}>{card.flatMap((row) => row.map((cell, cellIndex) => <span key={`${cardIndex}-${cell}-${cellIndex}`}>{cell}</span>))}</div>)}</div>
      </Panel>
    </div>
  );
}

function StoryDice({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const value = mergeState(state, { people: "轉學生\n時間旅人\n校園記者", places: "圖書館\n雨天操場\n未來教室", conflicts: "找不到關鍵證據\n必須合作完成任務\n誤會逐漸擴大", objects: "一張舊照片\n會發光的筆\n神秘便條", result: [] as string[] });
  const fields = [
    ["人物", "people"],
    ["地點", "places"],
    ["衝突", "conflicts"],
    ["物件", "objects"]
  ] as const;
  function roll() {
    setState({ ...value, result: fields.map(([, key]) => shuffle(textLines(value[key]))[0] ?? "") });
  }
  return (
    <div className="tool-grid">
      <Panel title="骰面設定">
        {fields.map(([label, key]) => <TextAreaField key={key} label={label} value={value[key]} onChange={(text) => setState({ ...value, [key]: text })} rows={3} />)}
      </Panel>
      <Panel title="寫作提示">
        <button className="primary-button" onClick={roll}><Shuffle size={16} />擲故事骰</button>
        <div className="dice-result">{fields.map(([label], index) => <div key={label}><span>{label}</span><strong>{value.result[index] ?? "等待擲骰"}</strong></div>)}</div>
      </Panel>
    </div>
  );
}

function WhiteboardTool({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const value = mergeState(state, { color: "#00d4ff", width: 4, notes: [] as Array<{ id: string; text: string }> });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

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
    drawing.current = true;
    ctx.beginPath();
    ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
  }

  function clear() {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="tool-grid">
      <Panel title="白板工具">
        <div className="two-col">
          <InputField label="筆色" type="color" value={value.color} onChange={(color) => setState({ ...value, color })} />
          <InputField label="筆粗" type="number" min={1} value={value.width} onChange={(width) => setState({ ...value, width: Number(width) })} />
        </div>
        <button className="secondary-button" onClick={() => setState({ ...value, notes: [...value.notes, { id: crypto.randomUUID(), text: "便利貼" }] })}><Plus size={16} />便利貼</button>
        <button className="secondary-button" onClick={clear}><Eraser size={16} />清除</button>
        <button className="primary-button" onClick={download}><Download size={16} />PNG</button>
      </Panel>
      <Panel title="畫布">
        <div className="whiteboard-wrap">
          <canvas ref={canvasRef} width={980} height={560} onPointerDown={start} onPointerMove={draw} onPointerUp={() => (drawing.current = false)} onPointerLeave={() => (drawing.current = false)} />
          <div className="sticky-layer">{value.notes.map((note) => <textarea key={note.id} value={note.text} onChange={(event) => setState({ ...value, notes: value.notes.map((entry) => (entry.id === note.id ? { ...entry, text: event.target.value } : entry)) })} />)}</div>
        </div>
      </Panel>
    </div>
  );
}

function CardSort({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const value = mergeState(state, { categories: "概念\n例子\n疑問", cards: "主旨\n段落大意\n作者觀點\n文本證據\n反例", placed: {} as Record<string, string> });
  const categories = textLines(value.categories);
  const cards = textLines(value.cards);

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
        <div className="unsorted-cards">{cards.filter((card) => !value.placed[card]).map((card) => <button draggable key={card} onDragStart={(event: DragEvent<HTMLButtonElement>) => event.dataTransfer.setData("text/plain", card)}>{card}</button>)}</div>
        <div className="sort-columns">
          {categories.map((category) => (
            <div key={category} className="sort-column" onDragOver={(event) => event.preventDefault()} onDrop={(event) => place(event.dataTransfer.getData("text/plain"), category)}>
              <h4>{category}</h4>
              {cards.filter((card) => value.placed[card] === category).map((card) => <button key={card} onClick={() => place(card, "")}>{card}</button>)}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function ConceptMap({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
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

function pointOnCircle(index: number, total: number, cx: number, cy: number, radius: number) {
  const angle = (Math.PI * 2 * index) / Math.max(1, total) - Math.PI / 2;
  return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
}

function TimelineTool({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
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

function NumberCoordinate({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const value = mergeState(state, { mode: "數線", min: -10, max: 10, points: "A, -3\nB, 4\nC, 7" });
  const points = textLines(value.points).map((line) => line.split(/,|，/).map((part) => part.trim()));
  const range = Math.max(1, value.max - value.min);

  return (
    <div className="tool-grid">
      <Panel title="座標設定">
        <label className="field"><span>模式</span><select value={value.mode} onChange={(event) => setState({ ...value, mode: event.target.value })}><option>數線</option><option>座標</option></select></label>
        <div className="two-col">
          <InputField label="最小值" type="number" value={value.min} onChange={(min) => setState({ ...value, min: Number(min) })} />
          <InputField label="最大值" type="number" value={value.max} onChange={(max) => setState({ ...value, max: Number(max) })} />
        </div>
        <TextAreaField label={value.mode === "數線" ? "點名,值" : "點名,x,y"} value={value.points} onChange={(pointsText) => setState({ ...value, points: pointsText })} />
      </Panel>
      <Panel title={value.mode}>
        {value.mode === "數線" ? (
          <div className="number-line">
            <div className="axis" />
            {points.map(([label, raw]) => {
              const pct = ((Number(raw) - value.min) / range) * 100;
              return <div key={label} className="line-point" style={{ left: `${pct}%` }}><span>{label}</span><strong>{raw}</strong></div>;
            })}
            <span className="axis-min">{value.min}</span><span className="axis-max">{value.max}</span>
          </div>
        ) : (
          <svg className="coordinate-board" viewBox="0 0 500 500">
            <line x1="250" y1="30" x2="250" y2="470" /><line x1="30" y1="250" x2="470" y2="250" />
            {points.map(([label, x, y]) => <g key={label}><circle cx={250 + Number(x) * 18} cy={250 - Number(y) * 18} r="8" /><text x={260 + Number(x) * 18} y={245 - Number(y) * 18}>{label}({x},{y})</text></g>)}
          </svg>
        )}
      </Panel>
    </div>
  );
}

function FractionTiles({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const value = mergeState(state, { numerator: 3, denominator: 8, mode: "長條" });
  const pieces = Array.from({ length: Math.max(1, value.denominator) }, (_, index) => index < value.numerator);

  return (
    <div className="tool-grid">
      <Panel title="分數設定">
        <div className="two-col">
          <InputField label="分子" type="number" min={0} value={value.numerator} onChange={(numerator) => setState({ ...value, numerator: Number(numerator) })} />
          <InputField label="分母" type="number" min={1} value={value.denominator} onChange={(denominator) => setState({ ...value, denominator: Number(denominator) })} />
        </div>
        <label className="field"><span>模型</span><select value={value.mode} onChange={(event) => setState({ ...value, mode: event.target.value })}><option>長條</option><option>圓形</option></select></label>
      </Panel>
      <Panel title="分數模型">
        <div className={value.mode === "圓形" ? "fraction-pie" : "fraction-bar"} style={{ "--segments": value.denominator, "--filled": value.numerator } as CSSProperties}>
          {value.mode === "長條" && pieces.map((filled, index) => <span key={index} className={filled ? "filled" : ""} />)}
        </div>
        <div className="fraction-label">{value.numerator} / {value.denominator}</div>
      </Panel>
    </div>
  );
}

function UnitFormula({ state, setState }: { state: unknown; setState: (value: unknown) => void }) {
  const value = mergeState(state, { amount: 1, from: "m", to: "cm", formulas: "速度 = 距離 ÷ 時間\n面積 = 長 × 寬\n密度 = 質量 ÷ 體積" });
  const conversions: Record<string, number> = { mm: 0.001, cm: 0.01, m: 1, km: 1000, g: 0.001, kg: 1 };
  const result = conversions[value.from] && conversions[value.to] ? (value.amount * conversions[value.from]) / conversions[value.to] : 0;

  return (
    <div className="tool-grid">
      <Panel title="單位換算">
        <InputField label="數值" type="number" value={value.amount} onChange={(amount) => setState({ ...value, amount: Number(amount) })} />
        <div className="two-col">
          <InputField label="從" value={value.from} onChange={(from) => setState({ ...value, from })} />
          <InputField label="到" value={value.to} onChange={(to) => setState({ ...value, to })} />
        </div>
        <div className="winner-display">{Number.isFinite(result) ? `${result.toLocaleString()} ${value.to}` : "未支援此換算"}</div>
      </Panel>
      <Panel title="公式卡">
        <TextAreaField label="每行一張公式卡" value={value.formulas} onChange={(formulas) => setState({ ...value, formulas })} />
        <div className="formula-cards">{textLines(value.formulas).map((formula) => <strong key={formula}>{formula}</strong>)}</div>
      </Panel>
    </div>
  );
}

function GenericTool({ definition, state, setState }: { definition: ToolDefinition; state: unknown; setState: (value: unknown) => void }) {
  const value = mergeState(state, { notes: "", result: "" });
  return (
    <div className="tool-grid">
      <Panel title="教師設定">
        <TextAreaField label="操作內容" value={value.notes} onChange={(notes) => setState({ ...value, notes })} />
      </Panel>
      <Panel title="結果區">
        <div className="projection-card">
          <h2>{definition.name}</h2>
          <p>{value.notes || definition.summary}</p>
        </div>
      </Panel>
    </div>
  );
}

function GemsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const categories = ["全部", ...Array.from(new Set(gems.map((gem) => gem.category)))];
  const filtered = gems.filter((gem) => {
    const matchesCategory = category === "全部" || gem.category === category;
    const matchesQuery = !query || [gem.name, gem.description, gem.category, ...gem.bestFor].join(" ").toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <section className="page-section">
      <div className="section-heading">
        <div><p className="eyebrow">AI / Gemini resources</p><h2>Gems 資源</h2><p>原 Gems Portal 已整併為獨立資源區，不混入無 AI 課堂工具。</p></div>
      </div>
      <div className="toolbar slim">
        <label className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋 Gems..." /></label>
        <div className="quick-buttons">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
      </div>
      <div className="resource-grid">
        {filtered.map((gem) => (
          <article key={gem.id} className="resource-card">
            <div className="resource-icon">{gem.icon}</div>
            <h3>{gem.name}</h3>
            <p>{gem.description}</p>
            <div className="meta-row"><span>{gem.category}</span>{gem.bestFor.slice(0, 2).map((item) => <span key={item}>{item}</span>)}</div>
            <a className="primary-button" href={gem.url} target="_blank" rel="noreferrer">開啟 Gem <ExternalLink size={16} /></a>
          </article>
        ))}
      </div>
    </section>
  );
}

function ExtensionsPage() {
  return (
    <section className="page-section">
      <div className="section-heading">
        <div><p className="eyebrow">Chrome Web Store</p><h2>Chrome 擴充功能</h2><p>建立數位敘事力系列擴充功能入口，GAS AI Companion 依目前本機資料標示為待上架。</p></div>
      </div>
      <div className="extension-list">
        {extensions.map((extension) => (
          <article className="extension-card" key={extension.id}>
            <div>
              <span className={extension.status === "待 CWS 連結" ? "status-pill pending" : "status-pill"}>{extension.status}</span>
              <h3>{extension.name}</h3>
              <p>{extension.summary}</p>
              <div className="feature-list">{extension.details.map((detail) => <span key={detail}>{detail}</span>)}</div>
            </div>
            <div className="extension-actions">
              {extension.cws ? <a className="primary-button" href={extension.cws} target="_blank" rel="noreferrer">Chrome Web Store <ExternalLink size={16} /></a> : <button className="primary-button disabled" disabled>待 CWS 連結</button>}
              {extension.github && <a className="secondary-button" href={extension.github} target="_blank" rel="noreferrer">GitHub <ExternalLink size={16} /></a>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SettingsPage({ toolState, onResetAll, onRestoreBackup }: { toolState: Record<string, unknown>; onResetAll: () => void; onRestoreBackup: (backup: ToolboxBackup) => void }) {
  const { roster } = useRoster();
  const { settings, updateSettings } = useSettings();
  const { downloadJson } = useExport();
  const [importText, setImportText] = useState("");

  function importBackup() {
    try {
      const backup = JSON.parse(importText) as ToolboxBackup;
      if (!backup?.settings || !Array.isArray(backup.roster)) throw new Error("Invalid backup");
      onRestoreBackup(backup);
    } catch {
      window.alert("JSON 格式無法讀取。");
    }
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <div><p className="eyebrow">Local data center</p><h2>我的設定</h2><p>所有資料留在瀏覽器本機，可備份、還原設定或清除。</p></div>
      </div>
      <div className="settings-grid">
        <Panel title="班級與投影">
          <InputField label="班級名稱" value={settings.className} onChange={(className) => updateSettings({ className })} />
          <label className="field"><span>字級</span><input type="range" min="0.9" max="1.35" step="0.05" value={settings.fontScale} onChange={(event) => updateSettings({ fontScale: Number(event.target.value) })} /></label>
          <label className="toggle-row"><input type="checkbox" checked={settings.projectionMode} onChange={(event) => updateSettings({ projectionMode: event.target.checked })} />投影模式</label>
          <label className="toggle-row"><input type="checkbox" checked={settings.reduceMotion} onChange={(event) => updateSettings({ reduceMotion: event.target.checked })} />降低動畫</label>
        </Panel>
        <Panel title="資料管理">
          <div className="stat-cards">
            <div><strong>{roster.length}</strong><span>名學生</span></div>
            <div><strong>{settings.favoriteToolIds.length}</strong><span>收藏工具</span></div>
            <div><strong>{Object.keys(toolState).length}</strong><span>工具資料</span></div>
          </div>
          <button className="primary-button" onClick={() => downloadJson("jdn-teaching-toolbox-backup.json", createBackup(roster, settings, toolState))}><FileJson size={16} />匯出備份 JSON</button>
          <button className="danger-button" onClick={onResetAll}><Trash2 size={16} />清除所有本機資料</button>
        </Panel>
        <Panel title="還原設定">
          <TextAreaField label="貼上備份 JSON" rows={8} value={importText} onChange={setImportText} />
          <button className="secondary-button" onClick={importBackup}>讀取設定</button>
        </Panel>
      </div>
    </section>
  );
}
