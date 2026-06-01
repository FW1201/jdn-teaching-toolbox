export type NotebookCategory =
  | "教師應用"
  | "TBCL華語文教學"
  | "學生學習"
  | "國文科"
  | "親師溝通";

export interface NotebookResource {
  id: string;
  title: string;
  category: NotebookCategory;
  icon: string;
  url: string;
  description: string;
  bestFor: string[];
  audience: string[];
  sourceType: "NotebookLM";
}

export const notebookCategories: NotebookCategory[] = [
  "教師應用",
  "TBCL華語文教學",
  "學生學習",
  "國文科",
  "親師溝通"
];

export const notebooks: NotebookResource[] = [
  {
    id: "lesson-planning",
    title: "教學備課",
    category: "教師應用",
    icon: "📋",
    url: "https://notebooklm.google.com/notebook/cd148d9e-a97d-4098-9420-f407938f8757",
    description: "整合課程設計、教學流程、教材改寫與差異化備課資料，適合在課前快速定位可用素材。",
    bestFor: ["課程設計", "教材改寫", "差異化備課"],
    audience: ["K-12 教師", "華語文教師"],
    sourceType: "NotebookLM"
  },
  {
    id: "administration",
    title: "行政工作",
    category: "教師應用",
    icon: "🗂️",
    url: "https://notebooklm.google.com/notebook/0ef529ad-c4ea-418f-8473-3583cf858f9e",
    description: "整理學校行政、表單、公文與會議處理脈絡，支援教師把重複行政工作變成可查詢範本。",
    bestFor: ["行政表單", "會議紀錄", "公文處理"],
    audience: ["教師", "行政人員"],
    sourceType: "NotebookLM"
  },
  {
    id: "homeroom",
    title: "導師工作",
    category: "教師應用",
    icon: "🌟",
    url: "https://notebooklm.google.com/notebook/7086dc74-b605-4581-b328-6f92e5fb6b6f",
    description: "聚焦導師班級經營、學生輔導、生活常規與事件處理紀錄，方便快速形成處理步驟。",
    bestFor: ["班級經營", "學生輔導", "生活常規"],
    audience: ["導師", "輔導教師"],
    sourceType: "NotebookLM"
  },
  {
    id: "teacher-regulations",
    title: "教師法規",
    category: "教師應用",
    icon: "⚖️",
    url: "https://notebooklm.google.com/notebook/c1e8d7c5-2b50-4847-a226-3014f33719f2",
    description: "彙整教師相關法規與校務規範，適合查找權責、流程、申請與溝通依據。",
    bestFor: ["法規查詢", "權責確認", "校務流程"],
    audience: ["教師", "行政人員"],
    sourceType: "NotebookLM"
  },
  {
    id: "teacher-portfolio",
    title: "教師檔案",
    category: "教師應用",
    icon: "📁",
    url: "https://notebooklm.google.com/notebook/a21eef2c-6350-4b79-b430-c6c6f2d019c3",
    description: "協助整理教師專業檔案、研習紀錄、成果敘述與教學歷程素材。",
    bestFor: ["專業檔案", "成果整理", "研習紀錄"],
    audience: ["教師", "教學組長"],
    sourceType: "NotebookLM"
  },
  {
    id: "tbcl-framework",
    title: "TBCL 標準體系",
    category: "TBCL華語文教學",
    icon: "🏛️",
    url: "https://notebooklm.google.com/notebook/b95b18af-c3d8-4bea-ab40-3d1eef982fab",
    description: "整理 TBCL 架構、等級描述與能力指標，作為華語文課程規劃與評量對齊基礎。",
    bestFor: ["TBCL 對齊", "課程規劃", "能力指標"],
    audience: ["華語文教師", "教材設計者"],
    sourceType: "NotebookLM"
  },
  {
    id: "tbcl-1",
    title: "TBCL 1 級",
    category: "TBCL華語文教學",
    icon: "1️⃣",
    url: "https://notebooklm.google.com/notebook/b15cf5a8-db3f-42c4-9639-c8bf246efe29",
    description: "針對 TBCL 1 級詞彙、語法與任務情境整理，可用於初級華語課程與練習設計。",
    bestFor: ["初級華語", "詞彙教學", "任務設計"],
    audience: ["華語文教師", "初級學習者"],
    sourceType: "NotebookLM"
  },
  {
    id: "tbcl-2",
    title: "TBCL 2 級",
    category: "TBCL華語文教學",
    icon: "2️⃣",
    url: "https://notebooklm.google.com/notebook/42f389b7-05e0-45e3-a741-8552a7617e7e",
    description: "支援 TBCL 2 級教材銜接、句型練習與溝通任務安排。",
    bestFor: ["初級進階", "句型練習", "溝通任務"],
    audience: ["華語文教師", "初級學習者"],
    sourceType: "NotebookLM"
  },
  {
    id: "tbcl-3",
    title: "TBCL 3 級",
    category: "TBCL華語文教學",
    icon: "3️⃣",
    url: "https://notebooklm.google.com/notebook/19f1d922-592f-4b4c-9a7b-8f97d09af872",
    description: "整理 TBCL 3 級常見學習目標、語言點與活動題型，適合銜接中級課程。",
    bestFor: ["中級銜接", "語言點整理", "活動題型"],
    audience: ["華語文教師", "中級學習者"],
    sourceType: "NotebookLM"
  },
  {
    id: "tbcl-4",
    title: "TBCL 4 級",
    category: "TBCL華語文教學",
    icon: "4️⃣",
    url: "https://notebooklm.google.com/notebook/5a09ca1c-02a5-440f-adc7-2cd344ddebcb",
    description: "支援 TBCL 4 級主題式輸入、讀寫整合與表達任務設計。",
    bestFor: ["中級華語", "讀寫整合", "主題式課程"],
    audience: ["華語文教師", "中級學習者"],
    sourceType: "NotebookLM"
  },
  {
    id: "tbcl-5",
    title: "TBCL 5 級",
    category: "TBCL華語文教學",
    icon: "5️⃣",
    url: "https://notebooklm.google.com/notebook/ddacffa9-6b30-4ff6-817d-ba4e76beae2b",
    description: "整理進階華語文本、議題討論與語用表達資料，適合高階課堂活動。",
    bestFor: ["進階華語", "議題討論", "語用表達"],
    audience: ["華語文教師", "高階學習者"],
    sourceType: "NotebookLM"
  },
  {
    id: "tbcl-6",
    title: "TBCL 6 級",
    category: "TBCL華語文教學",
    icon: "6️⃣",
    url: "https://notebooklm.google.com/notebook/bd043f90-5150-48d1-a763-116abaab2725",
    description: "聚焦 TBCL 6 級高階閱讀、專題表達與跨文本理解素材。",
    bestFor: ["高階閱讀", "專題表達", "跨文本理解"],
    audience: ["華語文教師", "高階學習者"],
    sourceType: "NotebookLM"
  },
  {
    id: "tbcl-7",
    title: "TBCL 7 級",
    category: "TBCL華語文教學",
    icon: "7️⃣",
    url: "https://notebooklm.google.com/notebook/cf7489a4-a0d4-4e92-9800-1b7822404071",
    description: "支援近母語高階表達、學術語篇與複雜議題討論設計。",
    bestFor: ["學術語篇", "高階表達", "複雜議題"],
    audience: ["華語文教師", "高階學習者"],
    sourceType: "NotebookLM"
  },
  {
    id: "learning-strategies",
    title: "學習策略",
    category: "學生學習",
    icon: "🧠",
    url: "https://notebooklm.google.com/notebook/5f4e5180-305d-40f7-afdc-bfc9737633a8",
    description: "整理讀書方法、時間管理、後設認知與複習策略，協助學生建立可持續學習方法。",
    bestFor: ["讀書方法", "時間管理", "複習策略"],
    audience: ["學生", "導師"],
    sourceType: "NotebookLM"
  },
  {
    id: "student-organization",
    title: "學生組織",
    category: "學生學習",
    icon: "👥",
    url: "https://notebooklm.google.com/notebook/37572df4-6dc4-4374-819a-bcbb141c13a1",
    description: "協助學生會、班級幹部與小組組織整理任務、會議與專案資料。",
    bestFor: ["學生自治", "班級幹部", "任務分工"],
    audience: ["學生", "導師"],
    sourceType: "NotebookLM"
  },
  {
    id: "emotion-thinking",
    title: "情緒思考",
    category: "學生學習",
    icon: "💭",
    url: "https://notebooklm.google.com/notebook/f1af9167-d009-43f6-9ae7-a285a9fae748",
    description: "聚焦情緒辨識、反思書寫與問題解決，適合輔導、導師課與自我探索。",
    bestFor: ["情緒辨識", "反思書寫", "問題解決"],
    audience: ["學生", "導師", "輔導教師"],
    sourceType: "NotebookLM"
  },
  {
    id: "learning-portfolio",
    title: "學習歷程",
    category: "學生學習",
    icon: "🗺️",
    url: "https://notebooklm.google.com/notebook/ad8ada20-140a-451d-b89a-3e287c7d417a",
    description: "支援學習歷程檔案整理、成果敘述、反思架構與資料取捨。",
    bestFor: ["學習歷程", "成果敘述", "反思架構"],
    audience: ["高中生", "導師"],
    sourceType: "NotebookLM"
  },
  {
    id: "paper-advisor",
    title: "小論顧問",
    category: "學生學習",
    icon: "📝",
    url: "https://notebooklm.google.com/notebook/1c8eb8fd-3924-40a0-a9de-baca392f3769",
    description: "整理小論文選題、研究問題、資料分析與寫作修訂流程。",
    bestFor: ["小論文", "研究問題", "寫作修訂"],
    audience: ["高中生", "指導教師"],
    sourceType: "NotebookLM"
  },
  {
    id: "chinese-knowledge",
    title: "語文常識學習",
    category: "國文科",
    icon: "📚",
    url: "https://shorturl.at/qyyRR",
    description: "國文語文常識、修辭、文體與文化知識整理，適合複習與課堂補充。",
    bestFor: ["國文複習", "語文常識", "課堂補充"],
    audience: ["國文教師", "學生"],
    sourceType: "NotebookLM"
  },
  {
    id: "exam-simulation",
    title: "會考試題模擬生成",
    category: "國文科",
    icon: "✍️",
    url: "https://shorturl.at/actyc",
    description: "整理會考國文題型、命題方向與試題模擬資料，支援考前練習設計。",
    bestFor: ["會考複習", "試題模擬", "命題參考"],
    audience: ["國文教師", "國中生"],
    sourceType: "NotebookLM"
  },
  {
    id: "classical-chinese",
    title: "古文學習",
    category: "國文科",
    icon: "📜",
    url: "https://shorturl.at/4j8EJ",
    description: "整理古文閱讀、字詞解釋、句法與文本脈絡，支援國文課堂與自學。",
    bestFor: ["古文閱讀", "字詞解釋", "文本脈絡"],
    audience: ["國文教師", "學生"],
    sourceType: "NotebookLM"
  },
  {
    id: "parent-teacher",
    title: "親師溝通",
    category: "親師溝通",
    icon: "💬",
    url: "https://notebooklm.google.com/notebook/dd8fec0b-4bcd-426d-8e78-775db6b1e4c1",
    description: "提供親師溝通紀錄、訊息撰寫、會談準備與衝突降溫素材。",
    bestFor: ["親師訊息", "會談準備", "溝通紀錄"],
    audience: ["導師", "家長溝通窗口"],
    sourceType: "NotebookLM"
  }
];
