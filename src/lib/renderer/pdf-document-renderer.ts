import { PDFDocumentElement } from "../elements/pdf-document-element";
import { PDFObjectManager } from "../utils/pdf-object-manager";
import { PageRenderer } from "./page-renderer";

export class PDFDocumentRenderer {
  static render(
    document: PDFDocumentElement,
    objectManager: PDFObjectManager
  ): number {
    const pageNumbers: number[] = [];
    // Render all pages
    document.pages.forEach((page) => {
      const pageNumber = PageRenderer.render(page, objectManager);
      pageNumbers.push(pageNumber);
    });

    // Add the pages object which reference all pages
    const pagesObject = `<< /Type /Pages /Kids [${pageNumbers.join(
      " 0 R "
    )} 0 R] /Count ${document.pages.length} >>`;
    const pagesObjectNumber = objectManager.addObject(pagesObject);

    // Set the parent object dynamically for all pages
    objectManager.setParentObjectNumber(pagesObjectNumber);

    return pagesObjectNumber;
  }
}
