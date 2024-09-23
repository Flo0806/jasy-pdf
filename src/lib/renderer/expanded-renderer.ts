import { PDFObjectManager } from "../utils/pdf-object-manager";
import { RendererRegistry } from "../utils/renderer-registry";
import { ExpandedElement } from "../elements";

export class ExpandedRenderer {
  static async render(
    expandedElement: ExpandedElement,
    objectManager: PDFObjectManager
  ): Promise<string> {
    const { child, x, y, width, height } = expandedElement.getProps();
    // For testing to make the `ExpandedElement` visible
    //let renderedContent = `1.000 0.000 0.000 RG\n${x} ${y} ${width} ${height}\nre S\n`;

    let renderedContent = "";

    // Pick the content of all elements of the page
    const renderer = RendererRegistry.getRenderer(child);
    console.log(RendererRegistry.isRendererAsync(renderer!));
    if (renderer) {
      renderedContent += await renderer(child, objectManager);
    }

    return renderedContent;
  }
}
