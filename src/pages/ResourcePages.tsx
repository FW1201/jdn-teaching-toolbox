import { useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { extensions } from "../data/extensions";
import { gems } from "../data/gems";
import { notebookCategories, notebooks } from "../data/notebooks";

export function NotebooksPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"全部" | (typeof notebookCategories)[number]>("全部");
  const filtered = notebooks.filter((notebook) => {
    const matchesCategory = category === "全部" || notebook.category === category;
    const matchesQuery =
      !query ||
      [notebook.title, notebook.description, notebook.category, ...notebook.bestFor, ...notebook.audience]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">NotebookLM public notebooks</p>
          <h2>NotebookLM 筆記本</h2>
          <p>整併 personal website 的 22 本公開筆記本，作為 AI 資源區，不混入無 AI 課堂工具。</p>
        </div>
      </div>
      <div className="toolbar slim">
        <label className="search-box">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋筆記本、分類、用途或對象..." />
        </label>
        <div className="quick-buttons">
          {["全部", ...notebookCategories].map((item) => (
            <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item as typeof category)}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="resource-grid">
        {filtered.map((notebook) => (
          <article key={notebook.id} className="resource-card">
            <div className="resource-icon">{notebook.icon}</div>
            <h3>{notebook.title}</h3>
            <p>{notebook.description}</p>
            <div className="meta-row">
              <span>{notebook.category}</span>
              {notebook.audience.slice(0, 2).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div className="feature-list">
              {notebook.bestFor.slice(0, 3).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <a className="primary-button" href={notebook.url} target="_blank" rel="noreferrer">
              前往 NotebookLM
              <ExternalLink size={16} />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

export function GemsPage() {
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

export function ExtensionsPage() {
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
