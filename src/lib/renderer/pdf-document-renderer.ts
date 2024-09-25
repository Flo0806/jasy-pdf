import { PDFDocumentElement } from "../elements/pdf-document-element";
import { PDFObjectManager } from "../utils/pdf-object-manager";
import { PageRenderer } from "./page-renderer";

export class PDFDocumentRenderer {
  static async render(
    document: PDFDocumentElement,
    objectManager: PDFObjectManager
  ): Promise<number> {
    const pageNumbers: number[] = [];

    // Add the pages object first... we need its object number (resources)
    const pagesObject = `<< /Type /Pages /Kids [] /Count ${
      document.getProps().children.length
    } >>`;
    const pagesObjectNumber = objectManager.addObject(pagesObject);

    // Now set the given object number all its childs
    objectManager.setParentObjectNumber(pagesObjectNumber);

    // Render all pages now that the Parent Object Number is set
    for (let page of document.getProps().children) {
      const pageNumber = await PageRenderer.render(page, objectManager);
      pageNumbers.push(pageNumber);
    }

    // We must update the pages object with the current page numbers...
    const updatedPagesObject = `<< /Type /Pages /Kids [${pageNumbers
      .map((num) => `${num} 0 R`)
      .join(" ")}] /Count ${document.getProps().children.length} >>`;

    // Now we must replace it in the object manager
    objectManager.replaceObject(pagesObjectNumber, updatedPagesObject);

    return pagesObjectNumber;
  }
}
