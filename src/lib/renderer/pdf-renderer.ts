import { PDFDocumentElement } from "../elements/pdf-document-element";
import { PDFDocumentRenderer } from "./pdf-document-renderer";
import { FontStyle, PDFObjectManager } from "../utils/pdf-object-manager";

export class PDFRenderer {
  static render(document: PDFDocumentElement): string {
    const objectManager = new PDFObjectManager();
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
