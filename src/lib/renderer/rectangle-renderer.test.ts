import { describe, it, expect, vi, beforeEach } from "vitest";
import { RectangleRenderer } from "./rectangle-renderer";
import { PDFObjectManager } from "../utils/pdf-object-manager";
import { RendererRegistry } from "../utils/renderer-registry";
import { RectangleElement } from "../elements/rectangle-element";
import { Color } from "../common/color";

describe("RectangleRenderer", () => {
  let mockObjectManager: PDFObjectManager;

  beforeEach(() => {
    mockObjectManager = {} as PDFObjectManager;

    // Mock RendererRegistry.getRenderer
    vi.spyOn(RendererRegistry, "getRenderer").mockReturnValue(undefined);
  });

  it("should render a rectangle with default black stroke and no background", async () => {
    const mockRectangleElement = {
      getProps: vi.fn().mockReturnValue({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        color: new Color(0, 0, 0),
        backgroundColor: undefined,
        borderWidth: 1,
        children: [],
      }),
    } as unknown as RectangleElement;

    const result = await RectangleRenderer.render(
      mockRectangleElement,
      mockObjectManager
    );

    expect(result).toBe("1 w\n0.000 0.000 0.000 RG\n10 20 100 50 re S\n");
  });

  it("should render a rectangle with a custom border color and no background", async () => {
    const mockRectangleElement = {
      getProps: vi.fn().mockReturnValue({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        color: new Color(255, 0, 0), // Red border color
        backgroundColor: undefined,
        borderWidth: 2,
        children: [],
      }),
    } as unknown as RectangleElement;

    const result = await RectangleRenderer.render(
      mockRectangleElement,
      mockObjectManager
    );

    expect(result).toBe("2 w\n1.000 0.000 0.000 RG\n10 20 100 50 re S\n");
  });

  it("should render a rectangle with a custom background color", async () => {
    const mockRectangleElement = {
      getProps: vi.fn().mockReturnValue({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        color: new Color(0, 0, 255), // Blue border color
        backgroundColor: new Color(0, 255, 0), // Green background
        borderWidth: 1,
        children: [],
      }),
    } as unknown as RectangleElement;

    const result = await RectangleRenderer.render(
      mockRectangleElement,
      mockObjectManager
    );

    expect(result).toBe(
      "1 w\n0.000 0.000 1.000 RG\n0.000 1.000 0.000 rg\n10 20 100 50 re B\n"
    );
  });

  it("should render a rectangle and its children", async () => {
    const mockChildElement = {
      getProps: vi.fn().mockReturnValue({
        x: 10,
        y: 20,
        width: 50,
        height: 25,
      }),
    };

    // Mock child renderer
    vi.spyOn(RendererRegistry, "getRenderer").mockReturnValue(async () => {
      return "child-rendered-content";
    });

    const mockRectangleElement = {
      getProps: vi.fn().mockReturnValue({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        color: new Color(0, 0, 255), // Blue border color
        backgroundColor: new Color(0, 255, 0), // Green background
        borderWidth: 1,
        children: [mockChildElement],
      }),
    } as unknown as RectangleElement;

    const result = await RectangleRenderer.render(
      mockRectangleElement,
      mockObjectManager
    );

    expect(result).toBe(
      "1 w\n0.000 0.000 1.000 RG\n0.000 1.000 0.000 rg\n10 20 100 50 re B\nchild-rendered-content"
    );
    expect(RendererRegistry.getRenderer).toHaveBeenCalledWith(mockChildElement);
  });
});
