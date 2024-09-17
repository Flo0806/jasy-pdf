import { PDFObjectManager } from "../utils/pdf-object-manager";
import { RendererRegistry } from "../utils/renderer-registry";
import { ExpandedElement } from "../elements";

export class ExpandedRenderer {
  static render(
    expandedElement: ExpandedElement,
    objectManager: PDFObjectManager
  ): string {
    const { child, x, y, width, height } = expandedElement.getProps();
    let renderedContent = `1.000 0.000 0.000 RG\n${x} ${y} ${width} ${height}\nre S\n`;

    // Pick the content of all elements of the page
    const renderer = RendererRegistry.getRenderer(child);
    if (renderer) {
      renderedContent += renderer(child, objectManager) + "\n";
    }

    return renderedContent;
  }
}
