import { useEffect } from "react";
import type { CSSProperties } from "react";
import { Check, Copy, Download, Minus, Plus, QrCode, Trash2 } from "lucide-react";
import QRCode from "qrcode";
import { copyToClipboard, escapeCsv, textLines } from "../../lib/toolLogic";
import type { Student } from "../../lib/types";
import { useExport } from "../../providers/ExportProvider";
import { useRoster } from "../../providers/RosterProvider";
import { useToast } from "../../hooks/useToast";
import { ConfirmButton } from "../ui/ConfirmButton";
import { InputField, Panel, TextAreaField, mergeState } from "../shared";
import type { ToolProps } from "../shared";

export function QuickPoll({ state, setState }: ToolProps) {
  const { downloadText } = useExport();
  const { notify } = useToast();
  const value = mergeState(state, { question: "你覺得今天最需要再複習的是？", options: ["概念", "例題", "操作", "合作"], votes: [0, 0, 0, 0] });

  function addVote(index: number, delta: number) {
    setState({ ...value, votes: value.votes.map((vote, voteIndex) => (voteIndex === index ? Math.max(0, vote + delta) : vote)) });
  }
  const max = Math.max(1, ...value.votes);
  const csv = ["選項,票數", ...value.options.map((option, index) => [option, String(value.votes[index] ?? 0)].map(escapeCsv).join(","))].join("\n");

  function updateOption(index: number, option: string) {
    setState({ ...value, options: value.options.map((item, itemIndex) => (itemIndex === index ? option : item)) });
  }

  return (
    <div className="tool-grid">
      <Panel title="投票題目">
        <InputField label="題目" value={value.question} onChange={(question) => setState({ ...value, question })} />
        <div className="list-editor">
          {value.options.map((option, index) => (
            <div className="list-row" key={index}>
              <input value={option} onChange={(event) => updateOption(index, event.target.value)} />
              <button className="icon-only" onClick={() => setState({ ...value, options: value.options.filter((_, itemIndex) => itemIndex !== index), votes: value.votes.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <button className="secondary-button" onClick={() => setState({ ...value, options: [...value.options, `選項 ${value.options.length + 1}`], votes: [...value.votes, 0] })}><Plus size={16} />新增選項</button>
      </Panel>
      <Panel title="投影統計" action={<button className="ghost-button" onClick={() => { downloadText("poll.csv", csv, "text/csv;charset=utf-8"); notify("已匯出投票結果 CSV", "success"); }}><Download size={16} />CSV</button>}>
        <div className="poll-card">
          <h3>{value.question}</h3>
          {value.options.map((option, index) => (
            <div className="poll-row" key={option}>
              <button onClick={() => addVote(index, -1)} aria-label="減一票"><Minus size={15} /></button>
              <button onClick={() => addVote(index, 1)}>+1</button>
              <span>{option}</span>
              <div className="bar"><i style={{ width: `${((value.votes[index] ?? 0) / max) * 100}%` }} /></div>
              <strong>{value.votes[index] ?? 0}</strong>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function ExitTicket({ state, setState }: ToolProps) {
  const { downloadText } = useExport();
  const { notify } = useToast();
  const value = mergeState(state, { title: "課末三問", questions: ["今天我學到...", "我還不確定...", "下一步我想..."], notes: "" });
  const output = `${value.title}\n\n${value.questions.map((question, index) => `${index + 1}. ${question}`).join("\n")}\n\n教師紀錄：\n${value.notes}`;

  return (
    <div className="tool-grid">
      <Panel title="題目模板">
        <InputField label="標題" value={value.title} onChange={(title) => setState({ ...value, title })} />
        <div className="list-editor">
          {value.questions.map((question, index) => (
            <div className="list-row" key={index}>
              <input value={question} onChange={(event) => setState({ ...value, questions: value.questions.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)) })} />
              <button className="icon-only" disabled={value.questions.length <= 1} onClick={() => setState({ ...value, questions: value.questions.filter((_, itemIndex) => itemIndex !== index) })} aria-label="刪除問題"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <button className="secondary-button" onClick={() => setState({ ...value, questions: [...value.questions, "新的問題..."] })}><Plus size={16} />新增問題</button>
        <TextAreaField label="教師紀錄" value={value.notes} onChange={(notes) => setState({ ...value, notes })} />
      </Panel>
      <Panel title="投影題目" action={<button className="ghost-button" onClick={() => { downloadText("exit-ticket.txt", output); notify("已匯出課末問題", "success"); }}><Download size={16} />匯出</button>}>
        <div className="projection-card">
          <h2>{value.title}</h2>
          <ol className="big-list">{value.questions.map((question, index) => <li key={index}>{question}</li>)}</ol>
        </div>
      </Panel>
    </div>
  );
}

export function UnderstandingMeter({ state, setState }: ToolProps) {
  const { downloadText } = useExport();
  const { notify } = useToast();
  const value = mergeState(state, { counts: [0, 0, 0, 0, 0], labels: ["完全不懂", "有點模糊", "大致理解", "可以練習", "能教別人"], note: "" });
  const total = value.counts.reduce((sum, count) => sum + count, 0);
  const csv = ["分數,標籤,人數", ...value.labels.map((label, index) => [String(index + 1), label, String(value.counts[index])].map(escapeCsv).join(","))].join("\n");

  return (
    <div className="tool-grid">
      <Panel title="快速點選">
        <div className="tool-meta-line"><span>目前累積 <strong>{total}</strong> 人次回應</span></div>
        <TextAreaField label="備註" rows={3} value={value.note} onChange={(note) => setState({ ...value, note })} />
        <ConfirmButton className="secondary-button" onConfirm={() => { setState({ ...value, counts: [0, 0, 0, 0, 0] }); notify("已清空理解統計"); }}>清空統計</ConfirmButton>
      </Panel>
      <Panel title={`全班理解狀態 · ${total} 人次`} action={<button className="ghost-button" onClick={() => { downloadText("understanding-meter.csv", csv, "text/csv;charset=utf-8"); notify("已匯出理解統計 CSV", "success"); }}><Download size={16} />CSV</button>}>
        <div className="meter-grid">
          {value.labels.map((label, index) => (
            <button key={label} className="meter-card" onClick={() => setState({ ...value, counts: value.counts.map((count, countIndex) => (countIndex === index ? count + 1 : count)) })}>
              <strong>{index + 1}</strong>
              <span>{label}</span>
              <em>{value.counts[index]}</em>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function QrBoard({ state, setState }: ToolProps) {
  const value = mergeState(state, { title: "課堂連結", url: "https://", hint: "掃描後開啟連結，完成後回到座位。", qr: "", qrFor: "" });

  useEffect(() => {
    if (!value.url || value.url === "https://" || value.qrFor === value.url) return;
    QRCode.toDataURL(value.url, { margin: 1, width: 420, color: { dark: "#0d1117", light: "#ffffff" } }).then((qr) => setState({ ...value, qr, qrFor: value.url }));
  }, [setState, value]);

  return (
    <div className="tool-grid">
      <Panel title="連結設定">
        <InputField label="標題" value={value.title} onChange={(title) => setState({ ...value, title })} />
        <InputField label="URL" value={value.url} onChange={(url) => setState({ ...value, url })} />
        <InputField label="操作提示" value={value.hint} onChange={(hint) => setState({ ...value, hint })} />
      </Panel>
      <Panel title="投影 QR">
        <div className="qr-card">
          <h2>{value.title}</h2>
          {value.qr ? <img src={value.qr} alt="QR code" /> : <QrCode size={180} />}
          <p>{value.hint}</p>
          <button className="secondary-button" onClick={() => copyToClipboard(value.url)}><Copy size={16} />複製連結</button>
        </div>
      </Panel>
    </div>
  );
}

export function Scoreboard({ state, setState }: ToolProps) {
  const { downloadText } = useExport();
  const { notify } = useToast();
  const value = mergeState(state, { teamsText: "第一組\n第二組\n第三組\n第四組", scores: {} as Record<string, number>, history: [] as string[] });
  const teams = textLines(value.teamsText);

  function adjust(team: string, delta: number) {
    const score = (value.scores[team] ?? 0) + delta;
    setState({ ...value, scores: { ...value.scores, [team]: score }, history: [`${new Date().toLocaleTimeString()} ${team} ${delta > 0 ? "+" : ""}${delta}`, ...value.history] });
  }

  const ranking = [...teams].sort((a, b) => (value.scores[b] ?? 0) - (value.scores[a] ?? 0));
  const csv = ["隊伍,分數", ...ranking.map((team) => [team, String(value.scores[team] ?? 0)].map(escapeCsv).join(","))].join("\n");

  return (
    <div className="tool-grid">
      <Panel title="隊伍設定">
        <TextAreaField label="每行一隊" value={value.teamsText} onChange={(teamsText) => setState({ ...value, teamsText })} />
        <button className="secondary-button" onClick={() => setState({ ...value, scores: {}, history: [] })}>重設分數</button>
      </Panel>
      <Panel title="投影排名" action={<button className="ghost-button" onClick={() => downloadText("scoreboard.csv", csv, "text/csv;charset=utf-8")}><Download size={16} />CSV</button>}>
        <div className="score-list">
          {ranking.map((team, index) => (
            <div className="score-row" key={team}>
              <span>{index + 1}</span>
              <strong>{team}</strong>
              <button onClick={() => adjust(team, -1)}>-1</button>
              <em>{value.scores[team] ?? 0}</em>
              <button onClick={() => adjust(team, 1)}>+1</button>
              <button onClick={() => adjust(team, 5)}>+5</button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function ParticipationTracker({ state, setState }: ToolProps) {
  const { roster } = useRoster();
  const { downloadText } = useExport();
  const value = mergeState(state, { eventType: "發言", counts: {} as Record<string, number>, history: [] as string[] });

  function record(student: Student) {
    setState({
      ...value,
      counts: { ...value.counts, [student.id]: (value.counts[student.id] ?? 0) + 1 },
      history: [[new Date().toLocaleTimeString(), student.seatNo, student.name, value.eventType].map(escapeCsv).join(","), ...value.history]
    });
  }

  const sorted = [...roster].sort((a, b) => (value.counts[a.id] ?? 0) - (value.counts[b.id] ?? 0));

  return (
    <div className="tool-grid">
      <Panel title="事件紀錄">
        <InputField label="事件類型" value={value.eventType} onChange={(eventType) => setState({ ...value, eventType })} />
        <div className="student-button-grid">{roster.map((student) => <button key={student.id} onClick={() => record(student)}>{student.seatNo} {student.name}<span>{value.counts[student.id] ?? 0}</span></button>)}</div>
      </Panel>
      <Panel title="低參與提醒" action={<button className="ghost-button" onClick={() => downloadText("participation.csv", ["時間,座號,姓名,事件", ...value.history].join("\n"), "text/csv;charset=utf-8")}><Download size={16} />CSV</button>}>
        <div className="result-list">{sorted.slice(0, 8).map((student) => <div className="result-row" key={student.id}><span>{student.seatNo} {student.name}</span><strong>{value.counts[student.id] ?? 0}</strong></div>)}</div>
      </Panel>
    </div>
  );
}

export function TaskChecklist({ state, setState }: ToolProps) {
  const value = mergeState(state, { groups: "第一組\n第二組\n第三組\n第四組", tasks: "閱讀文本\n完成討論\n寫下結論\n準備分享", done: {} as Record<string, boolean> });
  const groups = textLines(value.groups);
  const tasks = textLines(value.tasks);

  function toggle(group: string, task: string) {
    const key = `${group}:${task}`;
    setState({ ...value, done: { ...value.done, [key]: !value.done[key] } });
  }

  return (
    <div className="tool-grid">
      <Panel title="任務設定">
        <TextAreaField label="小組" value={value.groups} onChange={(groupsText) => setState({ ...value, groups: groupsText })} />
        <TextAreaField label="任務" value={value.tasks} onChange={(tasksText) => setState({ ...value, tasks: tasksText })} />
      </Panel>
      <Panel title="完成狀態">
        <div className="check-matrix" style={{ "--task-count": tasks.length } as CSSProperties}>
          <div />
          {tasks.map((task) => <strong key={task}>{task}</strong>)}
          {groups.flatMap((group) => [
            <strong key={`${group}-label`}>{group}</strong>,
            ...tasks.map((task) => {
              const key = `${group}:${task}`;
              return <button key={key} className={value.done[key] ? "checked" : ""} onClick={() => toggle(group, task)}>{value.done[key] ? <Check size={18} /> : ""}</button>;
            })
          ])}
        </div>
      </Panel>
    </div>
  );
}
