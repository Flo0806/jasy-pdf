import { PDFDocumentElement } from "../elements/pdf-document-element";

export class Validator {
  static validateDocument(document: PDFDocumentElement) {
    // Later more validation....
    document.pages.forEach((page) => {
      page.elements.forEach((element) => {
        if (element instanceof PDFDocumentElement) {
          throw new Error(
            "PDFDocument cannot be nested inside another element."
          );
        }
      });
    });
  }
}
