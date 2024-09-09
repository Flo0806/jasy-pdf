import { PDFDocument } from "../elements/pdf-document-element";
import { PageRenderer } from "./page-renderer";

export class PDFDocumentRenderer {
  static render(document: PDFDocument): string {
    // Render jede Seite des Dokuments
    const renderedPages = document.pages
      .map((page) => PageRenderer.render(page))
      .join("\n");

    return `<< /Type /Catalog >>\n${renderedPages}`;
  }
}
