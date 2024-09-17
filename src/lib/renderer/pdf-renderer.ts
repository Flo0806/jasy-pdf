import { PDFDocumentElement } from "../elements/pdf-document-element";
import { PDFDocumentRenderer } from "./pdf-document-renderer";
import { PDFObjectManager } from "../utils/pdf-object-manager";
import { RendererRegistry } from "../utils/renderer-registry";
import { TextElement } from "../elements";
import { TextRenderer } from "./text-renderer";
import { ContainerElement } from "../elements/container-element";
import { RectangleElement } from "../elements/rectangle-element";
import { ContainerRenderer } from "./container-renderer";
import { RectangleRenderer } from "./rectangle-renderer";

export class PDFRenderer {
  static render(document: PDFDocumentElement): string {
    const objectManager = new PDFObjectManager();

    // Register all Renderer
    RendererRegistry.register(TextElement, TextRenderer.render);
    RendererRegistry.register(ContainerElement, ContainerRenderer.render);
    RendererRegistry.register(RectangleElement, RectangleRenderer.render);

    let pdfContent = "";

    // Header
    pdfContent += "%PDF-1.4\n";

    document.calculateLayout();
    // Render pages and contents
    PDFDocumentRenderer.render(document, objectManager);

    // Add catalog objects
    const catalogObject = `<< /Type /Catalog /Pages ${objectManager.getParentObjectNumber()} 0 R >>`;
    objectManager.addObject(catalogObject);

    // Add rendered objects
    pdfContent += objectManager.getRenderedObjects();

    // Add XRef table and trailer
    const startxref = pdfContent.length;
    pdfContent += objectManager.getXRefTable();
    pdfContent += objectManager.getTrailerAndXRef(startxref);

    return pdfContent;
  }
}
