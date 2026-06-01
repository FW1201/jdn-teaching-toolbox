import type { ComponentType } from "react";
import { BookOpen, ExternalLink, Facebook, Grid3X3, Instagram, MessageCircle, Settings, Sparkles } from "lucide-react";
import { notebooks } from "../../data/notebooks";

export type Section = "tools" | "notebooks" | "gems" | "extensions" | "settings";

const SOCIAL_LINKS = [
  {
    href: "https://www.facebook.com/groups/digitalnarrative",
    icon: Facebook,
    label: "Facebook"
  },
  {
    href: "https://www.instagram.com/journal.digital.narrative",
    icon: Instagram,
    label: "Instagram"
  },
  {
    href: "https://www.threads.net/@journal.digital.narrative",
    icon: MessageCircle,
    label: "Threads"
  }
];

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
      {/* 品牌識別區 */}
      <div className="brand-block">
        <div className="brand-mark">JDN</div>
        <div>
          <strong>數位敘事力期刊</strong>
          <span>Journal Digital Narrative</span>
        </div>
      </div>

      {/* 主導航 */}
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

      {/* 社群媒體連結區 */}
      <div className="sidebar-footer">
        <p className="sidebar-footer-label">追蹤數位敘事力期刊</p>
        <div className="social-links">
          {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label={label}
              title={label}
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
        <p className="sidebar-dev-note">開發：數位敘事力期刊<br />Journal Digital Narrative</p>
      </div>
    </aside>
  );
}
