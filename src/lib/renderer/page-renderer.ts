import { pageFormats } from "../constants/page-sizes";
import { PageElement } from "../elements/page-element";
import { PDFElement } from "../elements/pdf-element";
import { PDFObjectManager } from "../utils/pdf-object-manager";
import { RendererRegistry } from "../utils/renderer-registry";
import { Orientation } from "./pdf-document-class";

export class PageRenderer {
  static async render(
    page: PageElement,
    objectManager: PDFObjectManager
  ): Promise<number> {
    let pageContent = "";
    const { children, config } = page.getProps();

    // Pick the content of all elements of the page
    for (let element of children) {
      const renderer = RendererRegistry.getRenderer(element);
      if (renderer) {
        pageContent += await renderer(element, objectManager);
      }
    }

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

    // - Get all images and add it to the page (reference)
    const imageReferences: string[] = [];
    objectManager.getAllImagesRaw().forEach((value) => {
      const imageRef = `/IM${value} ${value} 0 R`;
      imageReferences.push(imageRef);
    });
    const imageCode =
      imageReferences.length > 0
        ? "/ProcSet [/PDF /Text /ImageB /ImageC /ImageI] /XObject <<\n" +
          imageReferences.join("\n") +
          "\n>>\n"
        : "";

    let [width, height] = pageFormats[config?.pageSize!];
    if (config?.orientation === Orientation.landscape) {
      [width, height] = [height, width];
    }

    const pageObject = `<< /Type /Page /Parent ${parentObjectNumber} 0 R /Contents ${contentObjectNumber} 0 R /Resources <<\n/Font <<\n${fontReferences.join(
      "\n"
    )}\n>>\n${imageCode}>>\n/MediaBox [0 0 ${width} ${height}] >>`;

    // Add page as new object and return the page number
    return objectManager.addObject(pageObject);
  }
}
