import { describe, it, expect, vi, beforeEach } from "vitest";
import { PDFRenderer } from "./pdf-renderer";
import { PDFDocumentElement } from "../elements/pdf-document-element";
import { PDFObjectManager } from "../utils/pdf-object-manager";
import { RendererRegistry } from "../utils/renderer-registry";
import { TextElement } from "../elements/text-element";
import { ContainerElement } from "../elements/container-element";
import { RectangleElement } from "../elements/rectangle-element";
import { ImageElement } from "../elements/image-element";
import { ExpandedElement, PaddingElement } from "../elements";
import { PDFDocumentRenderer } from "./pdf-document-renderer";

describe("PDFRenderer", () => {
  let mockObjectManager: PDFObjectManager;

  beforeEach(() => {
    vi.clearAllMocks(); // Clear all mocks

    // Mock PDFObjectManager methods
    mockObjectManager = {
      addObject: vi.fn().mockReturnValue(1),
      getRenderedObjects: vi.fn().mockReturnValue("mocked rendered objects\n"),
      getXRefTable: vi.fn().mockReturnValue("xref table\n"),
      getTrailerAndXRef: vi.fn().mockReturnValue("trailer\nstartxref\n33"),
      getParentObjectNumber: vi.fn().mockReturnValue(1),
    } as unknown as PDFObjectManager;

    // Inject mockObjectManager
    PDFRenderer["_objectManager"] = mockObjectManager;
    vi.spyOn(PDFDocumentRenderer, "render").mockResolvedValue(1);

    // Mock RendererRegistry registration
    vi.spyOn(RendererRegistry, "register");
  });

  it("should register all renderers", async () => {
    const mockDocumentElement = {
      calculateLayout: vi.fn(),
      getProps: vi.fn().mockReturnValue({ children: [] }),
    } as unknown as PDFDocumentElement;

    await PDFRenderer.render(mockDocumentElement);

    // Check that all the renderers are registered
    expect(RendererRegistry.register).toHaveBeenCalledWith(
      TextElement,
      expect.any(Function)
    );
    expect(RendererRegistry.register).toHaveBeenCalledWith(
      ContainerElement,
      expect.any(Function)
    );
    expect(RendererRegistry.register).toHaveBeenCalledWith(
      RectangleElement,
      expect.any(Function)
    );
    expect(RendererRegistry.register).toHaveBeenCalledWith(
      ExpandedElement,
      expect.any(Function)
    );
    expect(RendererRegistry.register).toHaveBeenCalledWith(
      PaddingElement,
      expect.any(Function)
    );
    expect(RendererRegistry.register).toHaveBeenCalledWith(
      ImageElement,
      expect.any(Function)
    );
  });

  it("should call calculateLayout on the document element", async () => {
    const mockDocumentElement = {
      calculateLayout: vi.fn(),
    } as unknown as PDFDocumentElement;

    await PDFRenderer.render(mockDocumentElement);

    // Check that calculateLayout was called
    expect(mockDocumentElement.calculateLayout).toHaveBeenCalled();
  });

  it("should generate correct PDF content", async () => {
    const mockDocumentElement = {
      calculateLayout: vi.fn(),
    } as unknown as PDFDocumentElement;

    const result = await PDFRenderer.render(mockDocumentElement);

    // Verify the structure of the generated PDF content
    expect(result).toContain("%PDF-1.4\n");
    expect(result).toContain("mocked rendered objects");
    expect(result).toContain("xref table");
    expect(result).toContain("trailer");
  });

  it("should add the catalog object", async () => {
    const mockDocumentElement = {
      calculateLayout: vi.fn(),
    } as unknown as PDFDocumentElement;

    await PDFRenderer.render(mockDocumentElement);

    expect(mockObjectManager.addObject).toHaveBeenCalledWith(
      "<< /Type /Catalog /Pages 1 0 R >>"
    );
  });

  it("should add the correct XRef and trailer", async () => {
    const mockDocumentElement = {
      calculateLayout: vi.fn(),
    } as unknown as PDFDocumentElement;

    const result = await PDFRenderer.render(mockDocumentElement);

    // Check that XRef and trailer are appended correctly
    const startxref = result.indexOf("xref table");
    expect(result).toContain("xref table");
    expect(result).toContain(`startxref\n${startxref}`);
    expect(result).toContain("trailer");
  });

  it("should handle an empty document", async () => {
    const mockDocumentElement = {
      getProps: vi.fn().mockReturnValue({ children: [] }),
      calculateLayout: vi.fn(),
    } as unknown as PDFDocumentElement;

    const result = await PDFRenderer.render(mockDocumentElement);

    // Check that an empty document is handled correctly
    expect(result).toContain("%PDF-1.4\n");
    expect(result).toContain("mocked rendered objects");
    expect(result).toContain("xref table");
    expect(result).toContain("trailer");
  });
});
