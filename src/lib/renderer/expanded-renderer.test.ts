import { describe, it, expect, vi } from "vitest";
import { ExpandedRenderer } from "./expanded-renderer";
import { RendererRegistry } from "../utils/renderer-registry";
import { PDFObjectManager } from "../utils/pdf-object-manager";
import { ExpandedElement } from "../elements";
import { PDFElement } from "../elements/pdf-element";

describe("ExpandedRenderer", () => {
  it("should render the child element using its registered renderer", async () => {
    // Mock child element (it should be an instance of PDFElement or its subclass)
    const mockChild: PDFElement = {
      getProps: () => ({}), // Minimal implementation for PDFElement
      calculateLayout: vi.fn(),
      normalizeCoordinates: vi.fn(),
    } as unknown as PDFElement;

    // Mock the ExpandedElement with a child
    const mockExpandedElement: ExpandedElement = {
      getProps: () => ({
        child: mockChild,
        x: 0,
        y: 0,
        width: 100,
        height: 50,
      }),
      calculateLayout: vi.fn(),
      normalizeCoordinates: vi.fn(),
    } as unknown as ExpandedElement;

    // Mock PDFObjectManager
    const mockObjectManager = {} as PDFObjectManager;

    // Mock the renderer for the child element
    const mockChildRenderer = vi
      .fn()
      .mockResolvedValue("Rendered child content\n");

    // Spy on RendererRegistry to return the mock renderer for the child
    vi.spyOn(RendererRegistry, "getRenderer").mockReturnValue(
      mockChildRenderer
    );

    // Call the ExpandedRenderer's render method
    const result = await ExpandedRenderer.render(
      mockExpandedElement,
      mockObjectManager
    );

    // Check if the mock renderer for the child was called
    expect(mockChildRenderer).toHaveBeenCalledWith(
      mockChild,
      mockObjectManager
    );

    // Ensure that the final output contains the rendered content
    expect(result).toBe("Rendered child content\n");
  });

  it("should return an empty string if there is no renderer for the child element", async () => {
    // Mock child element
    const mockChild: PDFElement = {
      getProps: () => ({}),
      calculateLayout: vi.fn(),
      normalizeCoordinates: vi.fn(),
    } as unknown as PDFElement;

    // Mock the ExpandedElement with a child
    const mockExpandedElement: ExpandedElement = {
      getProps: () => ({
        child: mockChild,
        x: 0,
        y: 0,
        width: 100,
        height: 50,
      }),
      calculateLayout: vi.fn(),
      normalizeCoordinates: vi.fn(),
    } as unknown as ExpandedElement;

    // Mock PDFObjectManager
    const mockObjectManager = {} as PDFObjectManager;

    // Spy on RendererRegistry to return undefined for the child (no renderer found)
    vi.spyOn(RendererRegistry, "getRenderer").mockReturnValue(undefined);

    // Call the ExpandedRenderer's render method
    const result = await ExpandedRenderer.render(
      mockExpandedElement,
      mockObjectManager
    );

    // Ensure that the result is an empty string
    expect(result).toBe("");
  });
});
