import { describe, expect, it } from "vitest";
import { extensions } from "./extensions";
import { gems } from "./gems";
import { notebookCategories, notebooks } from "./notebooks";
import { toolsRegistry } from "./tools.registry";

describe("migrated resources", () => {
  it("keeps the full Gems Portal resource set separate from native tools", () => {
    expect(gems).toHaveLength(22);
    expect(gems.every((gem) => gem.url.startsWith("https://gemini.google.com/gem/"))).toBe(true);
  });

  it("keeps every Chrome extension entry and pending GAS status", () => {
    expect(extensions).toHaveLength(6);
    expect(extensions.filter((extension) => extension.cws).length).toBe(5);
    expect(extensions.find((extension) => extension.id === "gas-ai-companion")?.status).toBe("待 CWS 連結");
  });

  it("keeps NotebookLM resources separate from native tools", () => {
    expect(notebooks).toHaveLength(22);
    expect(new Set(notebooks.map((notebook) => notebook.category))).toEqual(new Set(notebookCategories));
    expect(notebooks.every((notebook) => notebook.sourceType === "NotebookLM")).toBe(true);
    expect(notebooks.every((notebook) => /^https:\/\//.test(notebook.url))).toBe(true);

    const nativeToolIds = new Set(toolsRegistry.map((tool) => tool.id));
    expect(notebooks.some((notebook) => nativeToolIds.has(notebook.id))).toBe(false);
  });
});
