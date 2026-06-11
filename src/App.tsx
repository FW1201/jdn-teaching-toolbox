import { useEffect, useMemo, useState } from "react";
import { EyeOff, FileJson, Monitor, RotateCcw } from "lucide-react";
import { toolsRegistry } from "./data/tools.registry";
import { createBackup } from "./lib/storage";
import type { ToolboxBackup } from "./lib/types";
import { useExport } from "./providers/ExportProvider";
import { useRoster } from "./providers/RosterProvider";
import { useSettings } from "./providers/SettingsProvider";
import { Sidebar } from "./components/layout/Sidebar";
import type { Section } from "./components/layout/Sidebar";
import { CategoryChips, ShowcaseStats, ToolCard, ToolsToolbar, WorkflowShortcuts, defaultFilter } from "./components/home/ToolsHome";
import type { FilterState } from "./components/home/ToolsHome";
import { QuickAccessShelf } from "./components/home/QuickAccessShelf";
import { scoreToolMatch } from "./lib/toolLogic";
import { ToolWorkspace } from "./components/ToolWorkspace";
import { ExtensionsPage, GemsPage, NotebooksPage } from "./pages/ResourcePages";
import { SettingsPage } from "./pages/SettingsPage";

interface AppProps {
  initialToolState: Record<string, unknown>;
  onToolStateChange: (state: Record<string, unknown>) => void;
  onResetAll: () => void;
  onRestoreBackup: (backup: ToolboxBackup) => void;
}

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
    const matches = toolsRegistry.filter((tool) => {
      const matchesCategory = filter.category === "全部" || tool.category === filter.category;
      const matchesStage = filter.stage === "全部" || tool.stage.includes(filter.stage);
      const matchesRoster = filter.roster === "全部" || (filter.roster === "需名單" ? tool.needsRoster : !tool.needsRoster);
      const matchesExport = filter.exportable === "全部" || (filter.exportable === "可匯出" ? tool.canExport : tool.projectionReady);
      const matchesSubject = filter.subject === "全部" || tool.subjects.includes(filter.subject);
      return matchesCategory && matchesStage && matchesRoster && matchesExport && matchesSubject;
    });
    if (!query) return matches;
    return matches
      .map((tool) => ({ tool, score: scoreToolMatch(tool, query) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.tool);
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
          <div className="topbar-brand">
            <div className="topbar-tag">數位敘事力期刊 · Journal Digital Narrative 開發</div>
            <h1>數位敘事力教學工具箱</h1>
            <p className="topbar-subtitle">整合 {toolsRegistry.length} 個自建課堂工具、NotebookLM 筆記本、Gems 資源與 Chrome 擴充功能，全部在本站內操作。</p>
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
            <QuickAccessShelf openTool={openTool} />
            <ToolsToolbar filter={filter} setFilter={setFilter} subjects={subjects} />
            <CategoryChips filter={filter} setFilter={setFilter} />
            <section className="tool-results">
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
            </section>
            {/* 展示性內容降到頁尾：上課動線優先 */}
            <WorkflowShortcuts openTool={openTool} />
            <ShowcaseStats />
          </>
        )}

        {section === "tools" && activeTool && (
          <ToolWorkspace
            definition={activeTool}
            toolState={toolState}
            updateToolState={updateToolState}
            onBack={() => setActiveToolId(null)}
            onOpenTool={openTool}
            onFavorite={() => toggleFavorite(activeTool.id)}
            isFavorite={settings.favoriteToolIds.includes(activeTool.id)}
          />
        )}

        {section === "notebooks" && <NotebooksPage />}
        {section === "gems" && <GemsPage />}
        {section === "extensions" && <ExtensionsPage />}
        {section === "settings" && <SettingsPage toolState={toolState} onResetAll={onResetAll} onRestoreBackup={onRestoreBackup} />}
      </main>
    </div>
  );
}
