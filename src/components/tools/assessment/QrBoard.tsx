import { useEffect } from "react";
import { Copy, Download, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { copyToClipboard } from "../../../lib/toolLogic";
import { useToast } from "../../../hooks/useToast";
import { InputField, Panel, mergeState } from "../../shared";
import type { ToolProps } from "../../shared";

export function QrBoard({ state, setState }: ToolProps) {
  const { notify } = useToast();
  const value = mergeState(state, { title: "課堂連結", url: "https://", hint: "掃描後開啟連結，完成後回到座位。", qr: "", qrFor: "" });
  const isValidUrl = /^https?:\/\/.+\..+/.test(value.url.trim());

  useEffect(() => {
    if (!value.url || value.url === "https://" || value.qrFor === value.url) return;
    QRCode.toDataURL(value.url, { margin: 1, width: 420, color: { dark: "#0d1117", light: "#ffffff" } }).then((qr) => setState({ ...value, qr, qrFor: value.url }));
  }, [setState, value]);

  function downloadQr() {
    if (!value.qr) return;
    const link = document.createElement("a");
    link.download = "qr-board.png";
    link.href = value.qr;
    link.click();
    notify("已下載 QR 圖片", "success");
  }

  return (
    <div className="tool-grid">
      <Panel title="連結設定">
        <InputField label="標題" value={value.title} onChange={(title) => setState({ ...value, title })} />
        <InputField label="URL" value={value.url} onChange={(url) => setState({ ...value, url })} />
        {!isValidUrl && value.url !== "https://" && <div className="notice-row warning">URL 格式可能不正確，請以 http(s):// 開頭並包含網域。</div>}
        <InputField label="操作提示" value={value.hint} onChange={(hint) => setState({ ...value, hint })} />
      </Panel>
      <Panel title="投影 QR">
        <div className="qr-card">
          <h2>{value.title}</h2>
          {value.qr ? <img src={value.qr} alt="QR code" /> : <QrCode size={180} />}
          <p>{value.hint}</p>
          <div className="action-row">
            <button className="secondary-button" onClick={() => { copyToClipboard(value.url); notify("已複製連結"); }}><Copy size={16} />複製連結</button>
            <button className="secondary-button" disabled={!value.qr} onClick={downloadQr}><Download size={16} />下載 QR</button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
