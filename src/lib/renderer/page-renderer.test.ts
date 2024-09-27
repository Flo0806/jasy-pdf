import { describe, it, expect, vi } from "vitest";
import { PageRenderer } from "./page-renderer";
import { PageElement } from "../elements/page-element";
import { PDFObjectManager } from "../utils/pdf-object-manager";
import { RendererRegistry } from "../utils/renderer-registry";

// Mock RendererRegistry.getRenderer method
vi.spyOn(RendererRegistry, "getRenderer").mockImplementation(() => {
  return vi.fn().mockResolvedValue("rendered content");
});

describe("PageRenderer", () => {
  it("should render a page and register the content correctly", async () => {
    // Mock PageElement
    const mockPageElement = {
      getProps: vi.fn().mockReturnValue({
        children: [
          { getProps: vi.fn() }, // Child element
        ],
      }),
    } as unknown as PageElement;

    // Mock PDFObjectManager
    const mockObjectManager = {
      addObject: vi.fn().mockReturnValue(1),
      getParentObjectNumber: vi.fn().mockReturnValue(1),
      registerFont: vi.fn(),
      getAllFontsRaw: vi.fn().mockReturnValue(
        new Map([
          [
            "Helvetica",
            {
              fontIndex: 1,
              resourceIndex: 1,
            },
          ],
        ])
      ),
      getAllImagesRaw: vi.fn().mockReturnValue(new Map()),
    } as unknown as PDFObjectManager;

    const pageNumber = await PageRenderer.render(
      mockPageElement,
      mockObjectManager
    );

    expect(mockPageElement.getProps).toHaveBeenCalled();
    expect(mockObjectManager.addObject).toHaveBeenCalledTimes(2); // Once for content, once for page
    expect(pageNumber).toBe(1); // Returns the page object number

    // Check if the renderer was called for the child element
    expect(RendererRegistry.getRenderer).toHaveBeenCalledWith(
      expect.anything()
    );
  });

  it("should render a page with image references", async () => {
    // Mock PageElement
    const mockPageElement = {
      getProps: vi.fn().mockReturnValue({
        children: [],
      }),
    } as unknown as PageElement;

    // Mock PDFObjectManager with image references
    const mockObjectManager = {
      addObject: vi.fn().mockReturnValue(1),
      getParentObjectNumber: vi.fn().mockReturnValue(1),
      registerFont: vi.fn(),
      getAllFontsRaw: vi.fn().mockReturnValue(new Map()),
      getAllImagesRaw: vi.fn().mockReturnValue(new Map([["image1", 2]])),
    } as unknown as PDFObjectManager;

    const pageNumber = await PageRenderer.render(
      mockPageElement,
      mockObjectManager
    );

    expect(mockPageElement.getProps).toHaveBeenCalled();
    expect(mockObjectManager.addObject).toHaveBeenCalledTimes(2); // Once for content, once for page
    expect(pageNumber).toBe(1); // Returns the page object number

    // Ensure that image references were added to the page
    expect(mockObjectManager.getAllImagesRaw).toHaveBeenCalled();
  });

  it("should handle multiple children and fonts correctly", async () => {
    // Mock PageElement
    const mockPageElement = {
      getProps: vi.fn().mockReturnValue({
        children: [
          { getProps: vi.fn() },
          { getProps: vi.fn() }, // Multiple children
        ],
      }),
    } as unknown as PageElement;

    // Mock PDFObjectManager with multiple fonts
    const mockObjectManager = {
      addObject: vi.fn().mockReturnValue(1),
      getParentObjectNumber: vi.fn().mockReturnValue(1),
      registerFont: vi.fn(),
      getAllFontsRaw: vi.fn().mockReturnValue(
        new Map([
          [
            "Helvetica",
            {
              fontIndex: 1,
              resourceIndex: 1,
            },
          ],
          [
            "Times-Roman",
            {
              fontIndex: 2,
              resourceIndex: 2,
            },
          ],
        ])
      ),
      getAllImagesRaw: vi.fn().mockReturnValue(new Map()),
    } as unknown as PDFObjectManager;

    const pageNumber = await PageRenderer.render(
      mockPageElement,
      mockObjectManager
    );

    expect(mockPageElement.getProps).toHaveBeenCalled();
    expect(mockObjectManager.addObject).toHaveBeenCalledTimes(2); // Once for content, once for page
    expect(pageNumber).toBe(1); // Returns the page object number

    // Ensure that font references were added
    expect(mockObjectManager.getAllFontsRaw).toHaveBeenCalled();
  });
});
