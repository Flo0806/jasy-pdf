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
        pageContent += TextRenderer.render(element, objectManager) + "\n";
      }
    });

    // Add the page content as a new object (content stream)
    const contentObjectNumber = objectManager.addObject(
      `<< /Length ${pageContent.length} >>\nstream\n${pageContent}endstream`
    );

    // Get the parent object number dynamically (linked with the page object)
    const parentObjectNumber = objectManager.getParentObjectNumber(); // Get parent object number
    console.log("Parent Object Number:", parentObjectNumber);

    // Page object with MediaBox
    // - Get all fonts and add it to the page (reference)
    objectManager.registerFont("Helvetica");
    const fontReferences: string[] = [];
    objectManager.getAllFontsRaw().forEach((value, key) => {
      const fontRef = `/F${value.fontIndex} ${value.resourceIndex} 0 R`;
      fontReferences.push(fontRef);
    });
    // const pageObject = `<< /Type /Page /Parent ${parentObjectNumber} 0 R /Contents ${contentObjectNumber} 0 R /Resources << /Font << /F${fontData.fontIndex} ${fontData.resourceIndex} 0 R >> >> /MediaBox [0 0 595 842] >>`;
    const pageObject = `<< /Type /Page /Parent ${parentObjectNumber} 0 R /Contents ${contentObjectNumber} 0 R /Resources << /Font << ${fontReferences.join(
      " "
    )} >> >> /MediaBox [0 0 595 842] >>`;

    // Add page as new object and return the page number
    return objectManager.addObject(pageObject);
  }
}
