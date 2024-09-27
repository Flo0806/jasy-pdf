import { describe, it, expect, vi, beforeEach } from "vitest";
import { PDFDocumentRenderer } from "./pdf-document-renderer";
import { PDFObjectManager } from "../utils/pdf-object-manager";
import { PageRenderer } from "./page-renderer";
import { PDFDocumentElement } from "../elements/pdf-document-element";

// Mock PageRenderer.render to return mock page numbers
vi.spyOn(PageRenderer, "render").mockImplementation(async () => 1);

describe("PDFDocumentRenderer", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear all mocks
  });

  it("should render a PDF document and return the pages object number", async () => {
    // Mock PDFDocumentElement
    const mockDocumentElement = {
      getProps: vi.fn().mockReturnValue({
        children: [{}, {}], // Two pages
      }),
    } as unknown as PDFDocumentElement;

    // Mock PDFObjectManager
    const mockObjectManager = {
      addObject: vi.fn().mockReturnValue(1),
      setParentObjectNumber: vi.fn(),
      replaceObject: vi.fn(),
    } as unknown as PDFObjectManager;

    const pagesObjectNumber = await PDFDocumentRenderer.render(
      mockDocumentElement,
      mockObjectManager
    );

    // Expect that the first object is added (the Pages object)
    expect(mockObjectManager.addObject).toHaveBeenCalledWith(
      "<< /Type /Pages /Kids [] /Count 2 >>"
    );
    expect(mockObjectManager.setParentObjectNumber).toHaveBeenCalledWith(1);

    // Expect that PageRenderer.render is called for each page
    expect(PageRenderer.render).toHaveBeenCalledTimes(2);

    // Expect the pages object to be replaced with the correct page references
    expect(mockObjectManager.replaceObject).toHaveBeenCalledWith(
      1,
      "<< /Type /Pages /Kids [1 0 R 1 0 R] /Count 2 >>"
    );

    // Ensure the returned pages object number is correct
    expect(pagesObjectNumber).toBe(1);
  });

  it("should handle rendering a document with no pages", async () => {
    // Mock PDFDocumentElement with no pages
    const mockDocumentElement = {
      getProps: vi.fn().mockReturnValue({
        children: [], // No pages
      }),
    } as unknown as PDFDocumentElement;

    // Mock PDFObjectManager
    const mockObjectManager = {
      addObject: vi.fn().mockReturnValue(1),
      setParentObjectNumber: vi.fn(),
      replaceObject: vi.fn(),
    } as unknown as PDFObjectManager;

    const pagesObjectNumber = await PDFDocumentRenderer.render(
      mockDocumentElement,
      mockObjectManager
    );

    // Verify that the children array is indeed empty
    expect(mockDocumentElement.getProps().children).toHaveLength(0);

    // Expect that the pages object is added with Count 0
    expect(mockObjectManager.addObject).toHaveBeenCalledWith(
      "<< /Type /Pages /Kids [] /Count 0 >>"
    );

    // Expect no calls to PageRenderer.render since there are no pages
    expect(PageRenderer.render).not.toHaveBeenCalled();

    // Ensure the pages object number is returned correctly
    expect(pagesObjectNumber).toBe(1);
  });
});
