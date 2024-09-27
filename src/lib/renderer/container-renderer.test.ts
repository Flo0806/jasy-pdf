import { describe, it, expect, vi } from "vitest";
import { ContainerRenderer } from "./container-renderer";
import { RendererRegistry } from "../utils/renderer-registry";
import { PDFObjectManager } from "../utils/pdf-object-manager";
import { ContainerElement } from "../elements/container-element";
import { PDFElement } from "../elements/pdf-element";

describe("ContainerRenderer", () => {
  it("should render children elements using their respective renderers", async () => {
    // Mock child elements (they should be instances of PDFElement or its subclasses)
    const mockChild1: PDFElement = {
      getProps: () => ({}), // Minimal implementation for PDFElement
      calculateLayout: vi.fn(),
      normalizeCoordinates: vi.fn(),
    } as unknown as PDFElement;

    const mockChild2: PDFElement = {
      getProps: () => ({}), // Minimal implementation for PDFElement
      calculateLayout: vi.fn(),
      normalizeCoordinates: vi.fn(),
    } as unknown as PDFElement;

    // Mock the ContainerElement with two children
    const mockContainerElement: ContainerElement = {
      getProps: () => ({
        x: 0,
        y: 0,
        width: 100,
        height: 200,
        children: [mockChild1, mockChild2],
      }),
      calculateLayout: vi.fn(),
      normalizeCoordinates: vi.fn(),
    } as unknown as ContainerElement;

    // Mock PDFObjectManager (not used directly in the test but needed as a parameter)
    const mockObjectManager = {} as PDFObjectManager;

    // Mock the renderers for the child elements
    const mockRenderer1 = vi.fn().mockResolvedValue("Rendered content 1\n");
    const mockRenderer2 = vi.fn().mockResolvedValue("Rendered content 2\n");

    // Spy on RendererRegistry to return mock renderers for each child
    vi.spyOn(RendererRegistry, "getRenderer")
      .mockImplementationOnce(() => mockRenderer1)
      .mockImplementationOnce(() => mockRenderer2);

    // Call the ContainerRenderer's render method
    const result = await ContainerRenderer.render(
      mockContainerElement,
      mockObjectManager
    );

    // Check if the correct renderers were called for each child
    expect(mockRenderer1).toHaveBeenCalledWith(mockChild1, mockObjectManager);
    expect(mockRenderer2).toHaveBeenCalledWith(mockChild2, mockObjectManager);

    // Ensure that the final output contains the rendered content
    expect(result).toBe("Rendered content 1\nRendered content 2\n");
  });

  it("should return an empty string if there are no children", async () => {
    // Mock the ContainerElement with no children
    const mockContainerElement: ContainerElement = {
      getProps: () => ({
        x: 0,
        y: 0,
        width: 100,
        height: 200,
        children: [],
      }),
      calculateLayout: vi.fn(),
      normalizeCoordinates: vi.fn(),
    } as unknown as ContainerElement;

    // Mock PDFObjectManager
    const mockObjectManager = {} as PDFObjectManager;

    // Call the ContainerRenderer's render method
    const result = await ContainerRenderer.render(
      mockContainerElement,
      mockObjectManager
    );

    // Check that the result is an empty string
    expect(result).toBe("");
  });

  it("should return an empty string if children are undefined", async () => {
    // Mock the ContainerElement with undefined children
    const mockContainerElement: ContainerElement = {
      getProps: () => ({
        x: 0,
        y: 0,
        width: 100,
        height: 200,
        children: undefined,
      }),
      calculateLayout: vi.fn(),
      normalizeCoordinates: vi.fn(),
    } as unknown as ContainerElement;

    // Mock PDFObjectManager
    const mockObjectManager = {} as PDFObjectManager;

    // Call the ContainerRenderer's render method
    const result = await ContainerRenderer.render(
      mockContainerElement,
      mockObjectManager
    );

    // Check that the result is an empty string
    expect(result).toBe("");
  });
});
