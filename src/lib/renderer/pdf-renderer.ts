import { PDFDocumentElement } from "../elements/pdf-document-element";
import { PDFDocumentRenderer } from "./pdf-document-renderer";
import { FontStyle, PDFObjectManager } from "../utils/pdf-object-manager";

export class PDFRenderer {
  static render(document: PDFDocumentElement): string {
    const objectManager = new PDFObjectManager();
    let pdfContent = "";

    // Header
    pdfContent += "%PDF-1.4\n";

    // Add all standard font families
    this.registerStandardFonts(objectManager);

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

  //#region  Helper
  // Method to register all standard fonts
  private static registerStandardFonts(objectManager: PDFObjectManager) {
    const standardFonts = [
      {
        fontName: "Helvetica",
        fontStyle: FontStyle.Normal,
        fullName: "Helvetica",
      },
      {
        fontName: "Helvetica",
        fontStyle: FontStyle.Bold,
        fullName: "Helvetica-Bold",
      },
      {
        fontName: "Helvetica",
        fontStyle: FontStyle.Italic,
        fullName: "Helvetica-Oblique",
      },
      {
        fontName: "Helvetica",
        fontStyle: FontStyle.BoldItalic,
        fullName: "Helvetica-BoldOblique",
      },

      { fontName: "Courier", fontStyle: FontStyle.Normal, fullName: "Courier" },
      {
        fontName: "Courier",
        fontStyle: FontStyle.Bold,
        fullName: "Courier-Bold",
      },
      {
        fontName: "Courier",
        fontStyle: FontStyle.Italic,
        fullName: "Courier-Oblique",
      },
      {
        fontName: "Courier",
        fontStyle: FontStyle.BoldItalic,
        fullName: "Courier-BoldOblique",
      },

      {
        fontName: "Times-Roman",
        fontStyle: FontStyle.Normal,
        fullName: "Times-Roman",
      },
      {
        fontName: "Times-Roman",
        fontStyle: FontStyle.Bold,
        fullName: "Times-Bold",
      },
      {
        fontName: "Times-Roman",
        fontStyle: FontStyle.Italic,
        fullName: "Times-Italic",
      },
      {
        fontName: "Times-Roman",
        fontStyle: FontStyle.BoldItalic,
        fullName: "Times-BoldItalic",
      },
    ];

    standardFonts.forEach((font) =>
      objectManager.registerFont(font.fontName, font.fontStyle, font.fullName)
    );
  }
  //#endregion
}
