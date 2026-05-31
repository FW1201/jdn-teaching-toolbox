export interface GemResource {
  id: string;
  name: string;
  category: "教學" | "學術" | "趣味" | "簡報" | "AI工具" | "繪圖" | "行政";
  icon: string;
  url: string;
  description: string;
  bestFor: string[];
}

export const gems: GemResource[] = [
  {
    id: "sign-language-cards",
    name: "手語教學圖卡",
    category: "教學",
    icon: "🤟",
    url: "https://gemini.google.com/gem/1tPlNSSgJ23OahVo_0aOVO7vMsDlqJWVj?usp=sharing",
    description: "協助教師把手語教學內容轉成圖卡、步驟說明與課堂演示素材。",
    bestFor: ["特殊教育", "多模態教學", "圖卡教材"]
  },
  {
    id: "academic-paper-notes",
    name: "學術論文筆記幫手",
    category: "學術",
    icon: "📚",
    url: "https://gemini.google.com/gem/1HGAsmR5gyxKI5b86R9DUClbpW5-1KfRl?usp=sharing",
    description: "將論文閱讀轉成結構化筆記，整理研究問題、方法、結果與可引用重點。",
    bestFor: ["文獻整理", "研究筆記", "讀書會"]
  },
  {
    id: "three-d-code-model",
    name: "3D程式模型圖製作",
    category: "趣味",
    icon: "🧊",
    url: "https://gemini.google.com/gem/10AVIpU7dsMZerAYpegS_w9Jdro9AdR-q?usp=sharing",
    description: "把概念或程式想法轉成可視化 3D 模型提示，適合展示與創作暖身。",
    bestFor: ["3D 概念", "創意展示", "程式視覺化"]
  },
  {
    id: "yaml-infographic",
    name: "YAML資訊圖表指令大師",
    category: "簡報",
    icon: "📊",
    url: "https://gemini.google.com/gem/1912ddlcEf9q-wtCJ4G8QLjaVC2Hfxtl_?usp=sharing",
    description: "把資訊圖卡需求整理成 YAML 指令，方便後續生成一致的視覺素材。",
    bestFor: ["資訊圖表", "圖卡規格", "視覺流程"]
  },
  {
    id: "yaml-slides",
    name: "YAML簡報指令大師",
    category: "簡報",
    icon: "🎞️",
    url: "https://gemini.google.com/gem/1Ezp6J75u0IrNQgxmzLZsRaOiNHdcsskx?usp=sharing",
    description: "把簡報主題整理成可生成投影片的 YAML 結構，提升簡報製作一致性。",
    bestFor: ["簡報大綱", "課程投影片", "模板化產出"]
  },
  {
    id: "music-creator",
    name: "狂想音樂創作家",
    category: "趣味",
    icon: "🎵",
    url: "https://gemini.google.com/gem/1UMJ5WiUzjSIlBm80ADnyC7gK3PFxTlrj?usp=sharing",
    description: "將主題、情境與風格轉成音樂創作提示，適合跨域課堂活動。",
    bestFor: ["音樂創作", "跨域活動", "情境引導"]
  },
  {
    id: "opal-gems-architect",
    name: "Opal Gems提示詞架構師",
    category: "AI工具",
    icon: "💎",
    url: "https://gemini.google.com/gem/1Ia7UDXHaS7SbkjNuU02u-a1LqF8JFnQH?usp=sharing",
    description: "協助設計 Gems 系統指令架構，適合建立可重複使用的 Gemini Gems。",
    bestFor: ["Gems 設計", "提示詞架構", "工具化"]
  },
  {
    id: "valentine-card-artist",
    name: "情人節圖卡繪師",
    category: "繪圖",
    icon: "💝",
    url: "https://gemini.google.com/gem/1S7FM5LjXm4e69S2wYx65CVE5ahBrd40S?usp=sharing",
    description: "產生節慶圖卡視覺提示，適合活動宣傳與節慶素材。",
    bestFor: ["節慶圖卡", "社群素材", "活動設計"]
  },
  {
    id: "assessment-illustrator",
    name: "素養試題配圖繪師",
    category: "繪圖",
    icon: "🖼️",
    url: "https://gemini.google.com/gem/1S7FM5LjXm4e69S2wYx65CVE5ahBrd40S?usp=sharing",
    description: "為素養題情境生成配圖提示，讓題目更容易投影與閱讀。",
    bestFor: ["素養命題", "情境配圖", "學習單"]
  },
  {
    id: "literacy-assessment-team",
    name: "素養試題設計專家團隊",
    category: "教學",
    icon: "📝",
    url: "https://gemini.google.com/gem/1Dw0XVHLVkDPVs7-tUicmBzU-5tP-rEUP?usp=sharing",
    description: "協助拆解學習目標、情境素材、題幹與評量重點，產出素養導向試題。",
    bestFor: ["素養命題", "評量設計", "108課綱"]
  },
  {
    id: "academic-figure-artist",
    name: "學術用圖快樂繪師",
    category: "繪圖",
    icon: "🎨",
    url: "https://gemini.google.com/gem/1VsWUL5qIdszLEWxGfTELDBxHEoSD2Bcj?usp=sharing",
    description: "把研究流程、架構與概念轉成學術圖像提示。",
    bestFor: ["研究架構圖", "論文簡報", "學術視覺"]
  },
  {
    id: "dok-worksheet",
    name: "DOK學習單設計專家",
    category: "教學",
    icon: "📋",
    url: "https://gemini.google.com/gem/1XyrMeJeMy7MSWP_NMx0bgJyO3on9yWGO?usp=sharing",
    description: "依 DOK 層次設計學習單題型，從回憶、技能到策略思考逐層安排。",
    bestFor: ["學習單", "DOK", "分層提問"]
  },
  {
    id: "poster-infographic-designer",
    name: "海報/資訊圖卡設計師",
    category: "繪圖",
    icon: "🗂️",
    url: "https://gemini.google.com/gem/15yRFwHA0vLzrsiu57USdmcz4HQfdctJZ?usp=sharing",
    description: "協助建立海報、社群圖卡與資訊圖表的視覺指令。",
    bestFor: ["社群圖卡", "海報", "資訊設計"]
  },
  {
    id: "digital-procurement-advisor",
    name: "數位精進採購小顧問",
    category: "行政",
    icon: "🛒",
    url: "https://gemini.google.com/gem/1qKIiprEPQmln6WkFfLmhaurRfaiVJhdY?usp=sharing",
    description: "協助整理數位精進採購需求、規格與行政注意事項。",
    bestFor: ["採購規格", "行政文件", "設備規劃"]
  },
  {
    id: "teaching-comic-expert",
    name: "教學用漫畫專家",
    category: "繪圖",
    icon: "💬",
    url: "https://gemini.google.com/gem/1jf5AoQg2hSmevQqLurP-9rPqWyBoXCjg?usp=sharing",
    description: "把課堂情境或概念轉成漫畫腳本與分鏡提示。",
    bestFor: ["漫畫教材", "情境引導", "角色對話"]
  },
  {
    id: "google-slides-edu",
    name: "Google Slides教育簡報專家",
    category: "簡報",
    icon: "📑",
    url: "https://gemini.google.com/gem/15jKCA1snnh2dAljoP7D0FkULXU73kfjZ?usp=sharing",
    description: "針對教育簡報產生大綱、頁面結構與視覺語氣建議。",
    bestFor: ["教育簡報", "Google Slides", "課程設計"]
  },
  {
    id: "gemini-gems-designer",
    name: "Gemini Gems提示詞設計師",
    category: "AI工具",
    icon: "⚙️",
    url: "https://gemini.google.com/gem/1jZyJUz8pihNMxNpzdylYt5NSQN4o7yed?usp=sharing",
    description: "協助把日常任務轉成 Gemini Gems 的角色、流程與輸出格式。",
    bestFor: ["Gems 建置", "提示詞設計", "工作流"]
  },
  {
    id: "visual-notes-designer",
    name: "圖解力筆記設計師",
    category: "學術",
    icon: "🗒️",
    url: "https://gemini.google.com/gem/1l77qEKaFbAFbvBwgbB04LyVlvpNHsctO?usp=sharing",
    description: "將閱讀、講座與研究內容轉成圖解筆記架構。",
    bestFor: ["視覺筆記", "講座摘要", "知識整理"]
  },
  {
    id: "black-white-worksheet",
    name: "黑白學習單大師",
    category: "教學",
    icon: "📄",
    url: "https://gemini.google.com/gem/1F-ekj1bpo2tHWJkxCmiBBRTcSvZelQ7c?usp=sharing",
    description: "聚焦可列印的黑白學習單，降低耗材並提升課堂實用度。",
    bestFor: ["列印學習單", "黑白版面", "課堂練習"]
  },
  {
    id: "official-doc-drafter",
    name: "公文草擬大師",
    category: "行政",
    icon: "📜",
    url: "https://gemini.google.com/gem/1KETnUC9TAjQ4Edu2cB3DG22N0PoxguHL?usp=sharing",
    description: "協助草擬學校行政公文、簽呈與通知文字。",
    bestFor: ["公文", "行政通知", "簽呈"]
  },
  {
    id: "literacy-lesson-designer",
    name: "素養導向教案設計師",
    category: "教學",
    icon: "🏫",
    url: "https://gemini.google.com/gem/1VydJloOuzZc29o1IdVlWHe_U_KaNsSwu?usp=sharing",
    description: "依學習目標、情境任務與評量規準設計素養導向教案。",
    bestFor: ["教案設計", "素養導向", "108課綱"]
  },
  {
    id: "prompt-optimizer",
    name: "提示詞優化專家",
    category: "AI工具",
    icon: "🔧",
    url: "https://gemini.google.com/gem/1n2ffavcC-qe4THgonxV4nNAdH8i5Ova4?usp=sharing",
    description: "把粗略需求改寫成更清楚的 AI 提示詞，支援角色、限制與輸出格式。",
    bestFor: ["提示詞優化", "AI 教學", "工作流"]
  }
];
