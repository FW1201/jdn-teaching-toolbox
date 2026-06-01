import { useState } from "react";
import { FileJson, Trash2 } from "lucide-react";
import { createBackup } from "../lib/storage";
import type { ToolboxBackup } from "../lib/types";
import { useExport } from "../providers/ExportProvider";
import { useRoster } from "../providers/RosterProvider";
import { useSettings } from "../providers/SettingsProvider";
import { InputField, Panel, TextAreaField } from "../components/shared";

export function SettingsPage({ toolState, onResetAll, onRestoreBackup }: { toolState: Record<string, unknown>; onResetAll: () => void; onRestoreBackup: (backup: ToolboxBackup) => void }) {
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
