import type { GroupResult, SeatingCell, Student } from "./types";

export function parseRoster(input: string): Student[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split(/,|\t/).map((part) => part.trim());
      if (parts.length === 1) {
        const seatNo = String(index + 1);
        const name = parts[0];
        return {
          id: stableStudentId(seatNo, name),
          seatNo,
          name,
          gender: "",
          note: ""
        };
      }
      const seatNo = parts[0] || String(index + 1);
      const name = parts[1] || parts[0] || `學生 ${index + 1}`;
      return {
        id: stableStudentId(seatNo, name),
        seatNo,
        name,
        gender: parts[2] ?? "",
        note: parts.slice(3).join(" / ")
      };
    });
}

export function stableStudentId(seatNo: string, name: string) {
  const normalizedSeatNo = seatNo.trim() || "no-seat";
  const normalizedName = name.trim() || "unnamed";
  return `student:${encodeURIComponent(normalizedSeatNo)}:${encodeURIComponent(normalizedName)}`;
}

export function rosterToCsv(roster: Student[]) {
  return ["座號,姓名,性別,備註", ...roster.map((student) => [student.seatNo, student.name, student.gender ?? "", student.note ?? ""].map(escapeCsv).join(","))].join("\n");
}

export function escapeCsv(value: string) {
  if (!/[",\n]/.test(value)) return value;
  return `"${value.replaceAll("\"", "\"\"")}"`;
}

export function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createSeatingCells(rows: number, cols: number, roster: Student[], mode: "random" | "seatNo"): SeatingCell[] {
  const ordered = mode === "random" ? shuffle(roster) : [...roster].sort((a, b) => Number(a.seatNo) - Number(b.seatNo));
  return Array.from({ length: rows * cols }, (_, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const student = ordered[index];
    return {
      id: `${row}-${col}`,
      row,
      col,
      studentId: student?.id,
      empty: !student
    };
  });
}

export function buildGroups(roster: Student[], groupCount: number, balanceGender: boolean): GroupResult[] {
  const count = Math.max(1, Math.min(groupCount, Math.max(1, roster.length)));
  const groups: GroupResult[] = Array.from({ length: count }, (_, index) => ({
    id: `g${index + 1}`,
    name: `第 ${index + 1} 組`,
    students: []
  }));

  const pool = balanceGender ? [...roster].sort((a, b) => (a.gender ?? "").localeCompare(b.gender ?? "")) : shuffle(roster);
  shuffle(pool).forEach((student, index) => {
    groups[index % count].students.push(student);
  });
  return groups;
}

export function groupsToCsv(groups: GroupResult[]) {
  return ["組別,座號,姓名,性別,備註", ...groups.flatMap((group) => group.students.map((student) => [group.name, student.seatNo, student.name, student.gender ?? "", student.note ?? ""].map(escapeCsv).join(",")))].join("\n");
}

export function createWordSearch(words: string[], size: number) {
  const normalized = words.map((word) => word.trim().toUpperCase()).filter(Boolean);
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => ""));
  const placements: Array<{ word: string; row: number; col: number; dir: "H" | "V" }> = [];

  normalized.forEach((word) => {
    const clean = word.slice(0, size);
    const dir = Math.random() > 0.45 ? "H" : "V";
    const maxRow = dir === "H" ? size : size - clean.length;
    const maxCol = dir === "H" ? size - clean.length : size;
    let placed = false;
    for (let attempt = 0; attempt < 60 && !placed; attempt += 1) {
      const row = Math.floor(Math.random() * Math.max(1, maxRow));
      const col = Math.floor(Math.random() * Math.max(1, maxCol));
      const fits = [...clean].every((char, offset) => {
        const r = dir === "H" ? row : row + offset;
        const c = dir === "H" ? col + offset : col;
        return !grid[r][c] || grid[r][c] === char;
      });
      if (!fits) continue;
      [...clean].forEach((char, offset) => {
        const r = dir === "H" ? row : row + offset;
        const c = dir === "H" ? col + offset : col;
        grid[r][c] = char;
      });
      placements.push({ word: clean, row, col, dir });
      placed = true;
    }
  });

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return {
    grid: grid.map((row) => row.map((cell) => cell || alphabet[Math.floor(Math.random() * alphabet.length)])),
    placements
  };
}

export function createBingoCards(words: string[], size: number, count: number) {
  const pool = words.map((word) => word.trim()).filter(Boolean);
  const cardSize = size * size;
  return Array.from({ length: Math.max(1, count) }, () => {
    const shuffled = shuffle(pool);
    const values = Array.from({ length: cardSize }, (_, index) => shuffled[index % shuffled.length] ?? "");
    return Array.from({ length: size }, (_, row) => values.slice(row * size, row * size + size));
  });
}

export function copyToClipboard(text: string) {
  return navigator.clipboard?.writeText(text);
}

export function textLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
