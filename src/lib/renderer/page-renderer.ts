import { PageElement } from "../elements/page-element";
import { PDFElement } from "../elements/pdf-element";
import { PDFObjectManager } from "../utils/pdf-object-manager";
import { RendererRegistry } from "../utils/renderer-registry";

export class PageRenderer {
  static render(page: PageElement, objectManager: PDFObjectManager): number {
    let pageContent = "";

    // Pick the content of all elements of the page
    page.getProps()["children"].forEach((element: PDFElement) => {
      const renderer = RendererRegistry.getRenderer(element);
      if (renderer) {
        pageContent += renderer(element, objectManager);
      }
    });

    // Add the page content as a new object (content stream)
    const contentObjectNumber = objectManager.addObject(
      `<</Length ${pageContent.length}>>\nstream\n${pageContent}endstream`
    );

    // Get the parent object number dynamically (linked with the page object)
    const parentObjectNumber = objectManager.getParentObjectNumber(); // Get parent object number

    // Page object with MediaBox
    // - Get all fonts and add it to the page (reference)
    objectManager.registerFont("Helvetica");
    const fontReferences: string[] = [];
    objectManager.getAllFontsRaw().forEach((value, key) => {
      const fontRef = `/F${value.fontIndex} ${value.resourceIndex} 0 R`;
      fontReferences.push(fontRef);
    });

    const pageObject = `<< /Type /Page /Parent ${parentObjectNumber} 0 R /Contents ${contentObjectNumber} 0 R /Resources <<\n/Font <<\n${fontReferences.join(
      "\n"
    )}\n>>\n>>\n/MediaBox [0 0 595 842] >>`;

    // Add page as new object and return the page number
    return objectManager.addObject(pageObject);
  }
}
