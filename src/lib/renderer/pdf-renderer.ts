import { PDFDocument } from "../elements/pdf-document-element";
import { PDFDocumentRenderer } from "./pdf-document-renderer";
import { Validator } from "../validators/element-validator";

export class PDFRenderer {
  static render(document: PDFDocument): string {
    // Validator aufrufen
    Validator.validateDocument(document);

    // Dokument rendern
    return PDFDocumentRenderer.render(document);
  }
}
