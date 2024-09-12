import { PDFDocumentElement } from "../elements/pdf-document-element";

export class Validator {
  static validateDocument(document: PDFDocumentElement) {
    // Later more validation....
    document.getProps().children.forEach((page) => {
      page.getProps().children.forEach((element) => {
        if (element instanceof PDFDocumentElement) {
          throw new Error(
            "PDFDocument cannot be nested inside another element."
          );
        }
      });
    });
  }
}
