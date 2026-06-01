import { describe, expect, it } from "vitest";
import { renderedToolIds } from "../components/ToolWorkspace";
import { toolsRegistry } from "./tools.registry";

describe("toolsRegistry", () => {
  it("keeps every tool id unique and self-hosted", () => {
    const ids = toolsRegistry.map((tool) => tool.id);
    expect(toolsRegistry).toHaveLength(33);
    expect(new Set(ids).size).toBe(ids.length);
    expect(toolsRegistry.every((tool) => tool.summary.length > 12 && tool.detail.length > 24)).toBe(true);
  });

  it("keeps registry and renderer mapping in sync", () => {
    const registryIds = toolsRegistry.map((tool) => tool.id);
    expect(renderedToolIds).toHaveLength(33);
    expect(new Set(renderedToolIds).size).toBe(renderedToolIds.length);
    expect(new Set(renderedToolIds)).toEqual(new Set(registryIds));
  });

  it("applies first-phase consolidation without leaking removed entries", () => {
    const ids = toolsRegistry.map((tool) => tool.id);
    expect(ids).toEqual(expect.arrayContaining(["station-rotation", "attendance-board", "discussion-tracker", "rubric-board", "text-annotator"]));
    expect(ids).not.toEqual(expect.arrayContaining(["visual-timer", "seat-constraints", "wheel", "understanding-meter", "bingo"]));
  });

  it("marks operational metadata for search filters", () => {
    expect(toolsRegistry.some((tool) => tool.needsRoster)).toBe(true);
    expect(toolsRegistry.some((tool) => tool.canExport)).toBe(true);
    expect(toolsRegistry.every((tool) => tool.stage.length > 0 && tool.tags.length > 0)).toBe(true);
  });
});
