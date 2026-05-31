export interface ExtensionResource {
  id: string;
  name: string;
  status: "已上架 CWS" | "已上架 CWS v2.1.2" | "已上架 CWS v8.5" | "待 CWS 連結";
  cws?: string;
  github?: string;
  summary: string;
  details: string[];
  tags: string[];
  audience: string[];
}

export const extensions: ExtensionResource[] = [
  {
    id: "chrome-edu-toolbox",
    name: "Chrome EDU Toolbox",
    status: "已上架 CWS",
    cws: "https://chromewebstore.google.com/detail/chrome-edu-toolbox/ghcbaidbgmbjembobdhpjlieopcnacoi",
    summary: "班級管理與互動評量 Chrome 側邊欄工具箱。",
    details: ["班級名單中心", "超連結管理", "課堂速記", "任務追蹤", "競賽排名", "投票系統"],
    tags: ["班級管理", "側邊欄", "Chromebook"],
    audience: ["教師", "導師"]
  },
  {
    id: "chatgpt-edu-prompt-assistant",
    name: "ChatGPT EDU Prompt Assistant TW",
    status: "已上架 CWS",
    cws: "https://chromewebstore.google.com/detail/chatgpt-edu-prompt-assist/hnnlhchjbkebmlbfpalgamheklhhibmd",
    github: "https://github.com/FW1201/ChatGPT-EDU-Prompt-Assistant-TW",
    summary: "台灣教育場域 ChatGPT 提示詞模板擴充功能。",
    details: ["中英雙語介面", "教師與學生提示詞庫", "GPTs 指令生成", "自訂提示詞", "Gemini API 優化"],
    tags: ["ChatGPT", "Prompt", "雙語"],
    audience: ["教師", "學生", "研究者"]
  },
  {
    id: "gemini-edu-prompt-assistant",
    name: "Gemini EDU Prompt Assistant TW",
    status: "已上架 CWS v2.1.2",
    cws: "https://chromewebstore.google.com/detail/gemini-edu-prompt-assista/hdgldjckecimnemejlogfiiebpbdnapa",
    summary: "Gemini 教育提示詞庫，含華語文 CEFR 專區。",
    details: ["100+ 教育提示詞", "華語文 CEFR 提示詞", "一鍵插入 Gemini", "自訂提示詞", "Gems 系統指令優化"],
    tags: ["Gemini", "CEFR", "提示詞"],
    audience: ["教師", "華語教師", "學生"]
  },
  {
    id: "notebooklm-edu-enhancer",
    name: "NotebookLM EDU Enhancer TW",
    status: "已上架 CWS v8.5",
    cws: "https://chromewebstore.google.com/detail/notebooklm-%E5%8C%AF%E5%87%BA%E5%B7%A5%E5%85%B7/modkfkgmcjbkjhjmhjakohhnfbleghoj",
    summary: "NotebookLM 教育增強器，整合提示詞庫、社群匯入與 Workspace 匯出。",
    details: ["教學/導師/行政提示詞庫", "X/Threads/Facebook 貼文匯入", "Google Docs/Sheets 匯出", "自定義 Library"],
    tags: ["NotebookLM", "Workspace", "社群匯入"],
    audience: ["教師", "主編", "行政"]
  },
  {
    id: "chrome-note-toolbox",
    name: "Chrome NOTE Toolbox",
    status: "已上架 CWS",
    cws: "https://chromewebstore.google.com/detail/chrome-note-toolbox/adfhmlcncdkgplckblejoggnmjekakkd",
    summary: "數位敘事力期刊主編工具箱，整合筆記、截圖、朗讀與生產力工具。",
    details: ["快速筆記", "截圖標註", "智慧書籤", "番茄鐘", "網頁語音朗讀", "Google Drive 整合"],
    tags: ["筆記", "主編", "生產力"],
    audience: ["主編", "教師", "知識工作者"]
  },
  {
    id: "gas-ai-companion",
    name: "GAS AI Companion",
    status: "待 CWS 連結",
    github: "https://github.com/FW1201/GAS-AI-Companion",
    summary: "Google Apps Script 編輯器側邊欄 AI 助手，本機資料顯示為私有或待上架。",
    details: ["Q&A 問答模式", "Code 程式碼模式", "Diff 差異預覽", "HtmlService 支援", "Monaco 編輯器注入", "API Key 本機儲存"],
    tags: ["GAS", "AI", "待上架"],
    audience: ["開發者", "教師"]
  }
];
