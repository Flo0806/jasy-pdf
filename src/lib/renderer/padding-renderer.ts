import { PDFObjectManager } from "../utils/pdf-object-manager";
import { RendererRegistry } from "../utils/renderer-registry";
import { PaddingElement } from "../elements/layout/padding-element";

export class PaddingRenderer {
  static async render(
    paddingElement: PaddingElement,
    objectManager: PDFObjectManager
  ): Promise<string> {
    const { child, x, y, width, height } = paddingElement.getProps();
    // For testing to make the `PaddingElement` visible
    let renderedContent = `1.000 0.000 0.000 RG\n1 w\n${x} ${y} ${width} ${height}\nre S\n`;

    //let renderedContent = "";

    // Pick the content of all elements of the page
    const renderer = RendererRegistry.getRenderer(child);
    console.log(RendererRegistry.isRendererAsync(renderer!));
    if (renderer) {
      renderedContent += await renderer(child, objectManager);
    }

    return renderedContent;
  }
}
