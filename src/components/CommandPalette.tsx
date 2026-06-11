import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, KeyboardEvent as ReactKeyboardEvent } from "react";
import { BookOpen, Clock, ExternalLink, Grid3X3, Monitor, Search, Settings, Sparkles, Wrench } from "lucide-react";
import { toolsRegistry } from "../data/tools.registry";
import { scoreToolMatch } from "../lib/toolLogic";
import { useSettings } from "../providers/SettingsProvider";
import type { Section } from "./layout/Sidebar";
import { categoryIcons } from "./home/ToolsHome";

interface PaletteItem {
  id: string;
  label: string;
  hint: string;
  icon: ComponentType<{ size?: number }>;
  run: () => void;
}

interface PaletteGroup {
  title: string;
  items: PaletteItem[];
}

const sectionEntries: Array<{ section: Section; label: string; icon: ComponentType<{ size?: number }> }> = [
  { section: "tools", label: "課堂工具", icon: Grid3X3 },
  { section: "notebooks", label: "NotebookLM", icon: BookOpen },
  { section: "gems", label: "Gems", icon: Sparkles },
  { section: "extensions", label: "Chrome 擴充", icon: ExternalLink },
  { section: "settings", label: "我的設定", icon: Settings }
];

export function CommandPalette({
  open,
  onClose,
  onOpenTool,
  onNavigate,
  onToggleProjection
}: {
  open: boolean;
  onClose: () => void;
  onOpenTool: (toolId: string) => void;
  onNavigate: (section: Section) => void;
  onToggleProjection: () => void;
}) {
  const { settings } = useSettings();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const groups = useMemo<PaletteGroup[]>(() => {
    const q = query.trim().toLowerCase();

    const toolItem = (toolId: string): PaletteItem | null => {
      const tool = toolsRegistry.find((entry) => entry.id === toolId);
      if (!tool) return null;
      return {
        id: `tool:${tool.id}`,
        label: tool.name,
        hint: tool.category,
        icon: categoryIcons[tool.category],
        run: () => onOpenTool(tool.id)
      };
    };

    if (!q) {
      const recent = settings.recentToolIds
        .slice(0, 6)
        .map(toolItem)
        .filter((item): item is PaletteItem => Boolean(item));
      const sections: PaletteItem[] = sectionEntries.map(({ section, label, icon }) => ({
        id: `section:${section}`,
        label,
        hint: "前往頁面",
        icon,
        run: () => onNavigate(section)
      }));
      const actions: PaletteItem[] = [
        { id: "action:projection", label: "切換投影模式", hint: "⌘⇧P", icon: Monitor, run: onToggleProjection }
      ];
      const result: PaletteGroup[] = [];
      if (recent.length > 0) result.push({ title: "最近使用", items: recent });
      result.push({ title: "頁面", items: sections });
      result.push({ title: "動作", items: actions });
      return result;
    }

    const toolMatches = toolsRegistry
      .map((tool) => ({ tool, score: scoreToolMatch(tool, q) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 9)
      .map((entry) => toolItem(entry.tool.id))
      .filter((item): item is PaletteItem => Boolean(item));

    const sectionMatches: PaletteItem[] = sectionEntries
      .filter(({ label }) => label.toLowerCase().includes(q))
      .map(({ section, label, icon }) => ({
        id: `section:${section}`,
        label,
        hint: "前往頁面",
        icon,
        run: () => onNavigate(section)
      }));

    const result: PaletteGroup[] = [];
    if (toolMatches.length > 0) result.push({ title: "課堂工具", items: toolMatches });
    if (sectionMatches.length > 0) result.push({ title: "頁面", items: sectionMatches });
    if (result.length === 0) result.push({ title: "沒有符合的結果", items: [] });
    return result;
  }, [query, settings.recentToolIds, onOpenTool, onNavigate, onToggleProjection]);

  const flatItems = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const clamped = Math.min(selected, Math.max(0, flatItems.length - 1));

  useEffect(() => {
    const node = listRef.current?.querySelector('[aria-selected="true"]');
    node?.scrollIntoView({ block: "nearest" });
  }, [clamped, groups]);

  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelected((value) => Math.min(value + 1, flatItems.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelected((value) => Math.max(value - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      flatItems[clamped]?.run();
    }
  }

  if (!open) return null;

  let runningIndex = -1;

  return (
    <div className="command-palette-backdrop" onClick={onClose}>
      <div
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-label="指令面板"
        onClick={(event) => event.stopPropagation()}
      >
        <label className="palette-input">
          <Search size={16} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="搜尋工具、頁面或動作..."
            aria-label="搜尋工具、頁面或動作"
          />
          <kbd>esc</kbd>
        </label>
        <div className="palette-list" role="listbox" aria-label="搜尋結果" ref={listRef}>
          {groups.map((group) => (
            <div key={group.title} className="palette-group">
              <p className="palette-group-title">{group.title}</p>
              {group.items.map((item) => {
                runningIndex += 1;
                const index = runningIndex;
                const Icon = item.icon ?? Wrench;
                return (
                  <button
                    key={item.id}
                    role="option"
                    aria-selected={index === clamped}
                    className={`palette-item ${index === clamped ? "selected" : ""}`}
                    onMouseEnter={() => setSelected(index)}
                    onClick={item.run}
                  >
                    <Icon size={16} />
                    <span className="palette-item-label">{item.label}</span>
                    <span className="palette-item-hint">{item.hint}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="palette-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> 選擇</span>
          <span><kbd>↵</kbd> 開啟</span>
          <span><Clock size={12} /> 最近使用優先</span>
        </div>
      </div>
    </div>
  );
}
