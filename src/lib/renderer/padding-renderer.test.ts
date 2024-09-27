import { describe, it, expect, vi } from "vitest";
import { PaddingRenderer } from "./padding-renderer";
import { PaddingElement } from "../elements/layout/padding-element";
import { PDFObjectManager } from "../utils/pdf-object-manager";
import { RendererRegistry } from "../utils/renderer-registry";

// Mock RendererRegistry.getRenderer method
vi.spyOn(RendererRegistry, "getRenderer").mockImplementation(() => {
  return vi.fn().mockResolvedValue("rendered child content");
});

describe("PaddingRenderer", () => {
  it("should render the content of the child element", async () => {
    // Mock PaddingElement
    const mockPaddingElement = {
      getProps: vi.fn().mockReturnValue({
        child: {
          getProps: vi.fn().mockReturnValue({
            x: 10,
            y: 20,
            width: 100,
            height: 50,
          }),
        },
        x: 10,
        y: 20,
        width: 100,
        height: 50,
      }),
    } as unknown as PaddingElement;

    // Mock PDFObjectManager
    const mockObjectManager = {} as PDFObjectManager;

    const result = await PaddingRenderer.render(
      mockPaddingElement,
      mockObjectManager
    );

    expect(mockPaddingElement.getProps).toHaveBeenCalled();
    expect(result).toContain("rendered child content");
  });

  it("should not render anything if no renderer is found", async () => {
    // Override the mock to return undefined for the renderer
    vi.spyOn(RendererRegistry, "getRenderer").mockImplementation(
      () => undefined
    );

    // Mock PaddingElement
    const mockPaddingElement = {
      getProps: vi.fn().mockReturnValue({
        child: {
          getProps: vi.fn().mockReturnValue({
            x: 10,
            y: 20,
            width: 100,
            height: 50,
          }),
        },
        x: 10,
        y: 20,
        width: 100,
        height: 50,
      }),
    } as unknown as PaddingElement;

    // Mock PDFObjectManager
    const mockObjectManager = {} as PDFObjectManager;

    const result = await PaddingRenderer.render(
      mockPaddingElement,
      mockObjectManager
    );

    expect(mockPaddingElement.getProps).toHaveBeenCalled();
    expect(result).toBe(""); // No content rendered
  });
});
