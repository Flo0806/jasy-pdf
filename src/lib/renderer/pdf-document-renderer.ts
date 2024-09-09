import { PDFDocumentElement } from "../elements/pdf-document-element";
import { PDFObjectManager } from "../utils/pdf-object-manager";
import { PageRenderer } from "./page-renderer";

export class PDFDocumentRenderer {
  static render(
    document: PDFDocumentElement,
    objectManager: PDFObjectManager
  ): number {
    const pageNumbers: number[] = [];

    // Add the pages object first... we need its object number (resources)
    const pagesObject = `<< /Type /Pages /Kids [] /Count ${document.pages.length} >>`;
    const pagesObjectNumber = objectManager.addObject(pagesObject);

    // Now set the given object number all its childs
    objectManager.setParentObjectNumber(pagesObjectNumber);

    // Render all pages now that the Parent Object Number is set
    document.pages.forEach((page) => {
      const pageNumber = PageRenderer.render(page, objectManager);
      pageNumbers.push(pageNumber);
    });

    // We must update the pages object with the current page numbers...
    const updatedPagesObject = `<< /Type /Pages /Kids [${pageNumbers
      .map((num) => `${num} 0 R`)
      .join(" ")}] /Count ${document.pages.length} >>`;

    // Now we must replace it in the object manager
    objectManager.replaceObject(pagesObjectNumber, updatedPagesObject);

    return pagesObjectNumber;
  }
}
