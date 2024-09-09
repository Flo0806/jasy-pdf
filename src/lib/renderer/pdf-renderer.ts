import { PDFDocumentElement } from "../elements/pdf-document-element";
import { PDFDocumentRenderer } from "./pdf-document-renderer";
import { Validator } from "../validators/element-validator";
import { PDF_PARTS } from "../constants/pdf-parts";
import { PDFObjectManager } from "../utils/pdf-object-manager";

export class PDFRenderer {
  static render(document: PDFDocumentElement): string {
    const objectManager = new PDFObjectManager();
    let pdfContent = "";

    // Header
    pdfContent += "%PDF-1.4\n";

    // Render pages and contents
    PDFDocumentRenderer.render(document, objectManager);

    // Add catalog objects
    const catalogObject = `<< /Type /Catalog /Pages ${objectManager.getParentObjectNumber()} 0 R >>`;
    objectManager.addObject(catalogObject);

    // Add all standard font families
    this.registerStandardFonts(objectManager);

    // Add rendered objects
    pdfContent += objectManager.getRenderedObjects();

    // Add XRef table and trailer
    const startxref = pdfContent.length;
    pdfContent += objectManager.getXRefTable();
    pdfContent += objectManager.getTrailerAndXRef(startxref);

    return pdfContent;
  }

  //#region  Helper
  // Method to register all standard fonts
  private static registerStandardFonts(objectManager: PDFObjectManager) {
    const standardFonts = [
      "Helvetica",
      "Helvetica-Bold",
      "Helvetica-Oblique",
      "Helvetica-BoldOblique",
      "Courier",
      "Courier-Bold",
      "Courier-Oblique",
      "Courier-BoldOblique",
      "Times-Roman",
      "Times-Bold",
      "Times-Italic",
      "Times-BoldItalic",
    ];

    standardFonts.forEach((font) => objectManager.registerFont(font));
  }
  //#endregion
}
