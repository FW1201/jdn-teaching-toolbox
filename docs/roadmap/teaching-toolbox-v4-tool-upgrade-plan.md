# 數位敘事力教學工具箱 V4 工具升級 Roadmap

本文件記錄 33 個 native classroom tools 的整併節奏。NotebookLM、Gems、Chrome Extensions 屬資源展示區，不列入 33 個工具數。

## 第一階段已執行

第一階段採 5 進 5 出，維持 `toolsRegistry.length === 33`。

| 整併方向 | 保留入口 | 新增工具 | 狀態 |
| --- | --- | --- | --- |
| `countdown` + `visual-timer` | `countdown` 計時工作台 | `station-rotation` 分站輪轉板 | 已進 registry |
| `random-picker` + `wheel` | `random-picker` 抽選中心 | `discussion-tracker` 討論追蹤器 | 已進 registry |
| `seating-chart` + `seat-constraints` | `seating-chart` 座位表產生器 | `attendance-board` 點名與狀態板 | 已進 registry |
| `quick-poll` + `understanding-meter` | `quick-poll` 快速回饋板 | `rubric-board` 規準評量板 | 已進 registry |
| `word-search` + `bingo` | `word-search` 字詞遊戲產生器 | `text-annotator` 文本標註器 | 已進 registry |

## 第二階段候選

第二階段先保留為 roadmap，不在第一階段同一輪修改 registry。

| 整併方向 | 保留入口 | 釋出名額新增工具 | 實作重點 |
| --- | --- | --- | --- |
| `group-maker` + `role-assigner` | 分組與角色工作台 | `gallery-walk` 作品展示牆 | 角色分配接續最新分組，作品牆支援輪播與回饋 |
| `scoreboard` + `task-checklist` | 小組任務與計分板 | `question-parking-lot` 問題停車場 | 任務進度與加分紀錄共用小組模型 |
| `flow-board` + `work-symbols` | 課堂流程與工作模式板 | `lesson-randomizer` 課堂任務籤筒 | 工作模式成為流程步驟欄位 |
| `card-sort` + `concept-map` | 概念整理板 | `compare-matrix` 比較矩陣 | 分類、歸納、連線改成同一操作工作台 |
| `number-coordinate` + `fraction-tiles` | 數學操作板 | `data-chart-board` 資料圖表板 | 數學投影模型整合，補足資料圖表工具 |

## 驗收規則

- `toolsRegistry.length` 固定為 33。
- 所有 registry id 必須有 renderer 對應。
- 被整併工具不能失去核心功能，需以 tab、mode 或 advanced panel 保留。
- 新增工具維持無 AI、本機操作、可投影、可匯出。
- 資源區不得混入 native tools registry。
