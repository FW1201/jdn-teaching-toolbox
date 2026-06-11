import type { ComponentType } from "react";
import { Clock, Star } from "lucide-react";
import { toolsRegistry } from "../../data/tools.registry";
import type { ToolDefinition } from "../../data/tools.registry";
import { useSettings } from "../../providers/SettingsProvider";
import { categoryIcons } from "./ToolsHome";

function resolveTools(ids: string[]): ToolDefinition[] {
  return ids.map((id) => toolsRegistry.find((tool) => tool.id === id)).filter((tool): tool is ToolDefinition => Boolean(tool));
}

function ShelfRow({
  icon: Icon,
  title,
  tools,
  variant,
  openTool
}: {
  icon: ComponentType<{ size?: number }>;
  title: string;
  tools: ToolDefinition[];
  variant?: "fav";
  openTool: (toolId: string) => void;
}) {
  return (
    <div className="quick-shelf-row">
      <span className="quick-shelf-label">
        <Icon size={14} />
        {title}
      </span>
      <div className="quick-shelf-items">
        {tools.map((tool) => {
          const CategoryIcon = categoryIcons[tool.category];
          return (
            <button key={tool.id} className={`quick-chip ${variant ?? ""}`} onClick={() => openTool(tool.id)}>
              <CategoryIcon size={15} />
              {tool.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function QuickAccessShelf({ openTool }: { openTool: (toolId: string) => void }) {
  const { settings } = useSettings();
  const favorites = resolveTools(settings.favoriteToolIds);
  const recents = resolveTools(settings.recentToolIds.filter((id) => !settings.favoriteToolIds.includes(id))).slice(0, 8);

  if (favorites.length === 0 && recents.length === 0) return null;

  return (
    <section className="quick-shelf" aria-label="快速啟用">
      {favorites.length > 0 && <ShelfRow icon={Star} title="我的收藏" tools={favorites} variant="fav" openTool={openTool} />}
      {recents.length > 0 && <ShelfRow icon={Clock} title="最近使用" tools={recents} openTool={openTool} />}
    </section>
  );
}
