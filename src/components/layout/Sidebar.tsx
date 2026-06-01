import type { ComponentType } from "react";
import { BookOpen, ExternalLink, Grid3X3, Settings, Sparkles } from "lucide-react";
import { notebooks } from "../../data/notebooks";

export type Section = "tools" | "notebooks" | "gems" | "extensions" | "settings";

export function Sidebar({ section, setSection, totalTools }: { section: Section; setSection: (section: Section) => void; totalTools: number }) {
  const items: Array<{ id: Section; label: string; icon: ComponentType<{ size?: number }>; meta: string }> = [
    { id: "tools", label: "課堂工具", icon: Grid3X3, meta: `${totalTools} 個` },
    { id: "notebooks", label: "NotebookLM 筆記本", icon: BookOpen, meta: `${notebooks.length} 本` },
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
          <span>整合成果展示區</span>
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
