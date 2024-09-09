import { PDFDocument } from "../elements/pdf-document";

export class Validator {
  static validateDocument(document: PDFDocument) {
    // Hier können Validierungen hinzugefügt werden, z.B. keine PDFDocument-Kinder in Text-Elementen
    document.pages.forEach((page) => {
      page.elements.forEach((element) => {
        if (element instanceof PDFDocument) {
          throw new Error(
            "PDFDocument cannot be nested inside another element."
          );
        }
      });
    });
  }
}
