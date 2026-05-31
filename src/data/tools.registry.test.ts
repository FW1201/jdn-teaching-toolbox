import { describe, expect, it } from "vitest";
import { toolsRegistry } from "./tools.registry";

describe("toolsRegistry", () => {
  it("keeps every tool id unique and self-hosted", () => {
    const ids = toolsRegistry.map((tool) => tool.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(toolsRegistry.length).toBeGreaterThanOrEqual(30);
    expect(toolsRegistry.every((tool) => tool.summary.length > 12 && tool.detail.length > 24)).toBe(true);
  });

  it("marks operational metadata for search filters", () => {
    expect(toolsRegistry.some((tool) => tool.needsRoster)).toBe(true);
    expect(toolsRegistry.some((tool) => tool.canExport)).toBe(true);
    expect(toolsRegistry.every((tool) => tool.stage.length > 0 && tool.tags.length > 0)).toBe(true);
  });
});
