import { describe, expect, it } from "vitest";
import { buildGroups, createBingoCards, createSeatingCells, createWordSearch, parseRoster, rosterToCsv, stableStudentId } from "./toolLogic";

describe("roster parsing", () => {
  it("parses csv rows with notes", () => {
    const roster = parseRoster("1,王小明,男,前排\n2,陳小華,女");
    expect(roster).toHaveLength(2);
    expect(roster[0]).toMatchObject({ id: stableStudentId("1", "王小明"), seatNo: "1", name: "王小明", gender: "男", note: "前排" });
    expect(rosterToCsv(roster)).toContain("座號,姓名,性別,備註");
  });

  it("keeps stable student ids when the same roster is imported again", () => {
    const first = parseRoster("1,王小明,男,前排\n2,陳小華,女");
    const second = parseRoster("1,王小明,男,前排\n2,陳小華,女");
    expect(second.map((student) => student.id)).toEqual(first.map((student) => student.id));
  });
});

describe("classroom generators", () => {
  const roster = parseRoster("1,A,男\n2,B,女\n3,C,男\n4,D,女\n5,E,男\n6,F,女");

  it("creates seating cells for every row and column", () => {
    const cells = createSeatingCells(2, 3, roster, "seatNo");
    expect(cells).toHaveLength(6);
    expect(cells[0].studentId).toBe(roster[0].id);
  });

  it("builds requested group count", () => {
    const groups = buildGroups(roster, 3, true);
    expect(groups).toHaveLength(3);
    expect(groups.flatMap((group) => group.students)).toHaveLength(roster.length);
  });

  it("generates printable language activities", () => {
    const puzzle = createWordSearch(["CLASS", "READ"], 8);
    expect(puzzle.grid).toHaveLength(8);
    expect(puzzle.placements.length).toBeGreaterThan(0);
    const cards = createBingoCards(["A", "B", "C", "D"], 3, 2);
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveLength(3);
  });
});
