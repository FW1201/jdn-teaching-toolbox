import type { ComponentType } from "react";
import { BarChart3, BookOpen, ChevronRight, CircleDot, Download, Filter, Grid3X3, Layers, Search, Star, Timer, Users } from "lucide-react";
import { extensions } from "../../data/extensions";
import { gems } from "../../data/gems";
import { notebooks } from "../../data/notebooks";
import { lessonStages, toolCategories, toolsRegistry } from "../../data/tools.registry";
import type { LessonStage, ToolCategory, ToolDefinition } from "../../data/tools.registry";

export interface FilterState {
  query: string;
  category: "全部" | ToolCategory;
  stage: "全部" | LessonStage;
  roster: "全部" | "需名單" | "不需名單";
  exportable: "全部" | "可匯出" | "僅投影";
  subject: string;
}

export const defaultFilter: FilterState = {
  query: "",
  category: "全部",
  stage: "全部",
  roster: "全部",
  exportable: "全部",
  subject: "全部"
};

export const categoryIcons: Record<ToolCategory, ComponentType<{ size?: number }>> = {
  流程與秩序: Timer,
  名單與分組: Users,
  互動評量: BarChart3,
  語文活動: BookOpen,
  視覺整理: Layers,
  數學與科學: CircleDot
};

const workflowShortcuts = [
  { title: "建立名單", path: "班級名單中心 → 隨機抽人 / 隨機分組 / 座位表", toolIds: ["roster-center", "random-picker", "group-maker", "seating-chart"] },
  { title: "課堂節奏", path: "今日流程板 → 倒數計時器 → 交通燈 / 工作模式", toolIds: ["flow-board", "countdown", "traffic-light", "work-symbols"] },
  { title: "小組任務", path: "隨機分組 → 角色分配 → 計分板 → 任務檢核", toolIds: ["group-maker", "role-assigner", "scoreboard", "task-checklist"] },
  { title: "語文活動", path: "字詞卡 → 克漏字 → 句子重組 → 賓果", toolIds: ["flashcards", "cloze", "sentence-scramble", "bingo"] }
];

export function ToolsToolbar({ filter, setFilter, subjects }: { filter: FilterState; setFilter: (filter: FilterState) => void; subjects: string[] }) {
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

export function CategoryChips({ filter, setFilter }: { filter: FilterState; setFilter: (filter: FilterState) => void }) {
  return (
    <section className="category-chips" aria-label="工具分類">
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
    </section>
  );
}

export function ShowcaseStats() {
  const stats = [
    { value: toolsRegistry.length, label: "課堂工具" },
    { value: notebooks.length, label: "NotebookLM" },
    { value: gems.length, label: "Gems" },
    { value: extensions.length, label: "Chrome Extensions" }
  ];
  return (
    <section className="showcase-stats" aria-label="整合成果統計">
      {stats.map((stat) => (
        <div key={stat.label}>
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </div>
      ))}
    </section>
  );
}

export function WorkflowShortcuts({ openTool }: { openTool: (toolId: string) => void }) {
  return (
    <section className="workflow-shortcuts" aria-label="常用課堂流程">
      {workflowShortcuts.map((shortcut) => (
        <article key={shortcut.title}>
          <div>
            <strong>{shortcut.title}</strong>
            <span>{shortcut.path}</span>
          </div>
          <button className="ghost-button" onClick={() => openTool(shortcut.toolIds[0])}>
            開始
            <ChevronRight size={16} />
          </button>
        </article>
      ))}
    </section>
  );
}

export function ToolCard({ tool, isFavorite, isRecent, onOpen, onFavorite }: { tool: ToolDefinition; isFavorite: boolean; isRecent: boolean; onOpen: () => void; onFavorite: () => void }) {
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
