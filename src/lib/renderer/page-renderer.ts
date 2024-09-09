import { TextElement } from "../elements";
import { PageElement } from "../elements/page-element";
import { PDFObjectManager } from "../utils/pdf-object-manager";
import { TextRenderer } from "./text-renderer";

export class PageRenderer {
  static render(page: PageElement, objectManager: PDFObjectManager): number {
    let pageContent = "";

    // Pick the content of all elements of the page
    page.elements.forEach((element) => {
      if (element instanceof TextElement) {
        pageContent += TextRenderer.render(element) + "\n";
      }
    });

    // Add the page content as a new object (content stream)
    const contentObjectNumber = objectManager.addObject(
      `<< /Length ${pageContent.length} >>\nstream\n${pageContent}endstream`
    );

    // Get the parent object number dynamaically (linked with the page object)
    const parentObjectNumber = objectManager.getParentObjectNumber(); // Get parent object number
    const pageObject = `<< /Type /Page /Parent ${parentObjectNumber} 0 R /Contents ${contentObjectNumber} 0 R >>`;

    // Add page as new object and return the page number
    return objectManager.addObject(pageObject);
  }
}
