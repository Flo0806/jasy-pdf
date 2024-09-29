import { PDFObjectManager } from "../utils/pdf-object-manager";

import { RectangleElement } from "../elements/rectangle-element";
import { RendererRegistry } from "../utils/renderer-registry";

export class RectangleRenderer {
  static async render(
    rectangleElement: RectangleElement,
    objectManager: PDFObjectManager
  ): Promise<string> {
    const {
      x,
      y,
      width,
      height,
      children,
      color,
      backgroundColor,
      borderWidth,
    } = rectangleElement.getProps();
    let renderedContent = "";

    // Beginne das Zeichnen eines Rechtecks, das die Größe der Box darstellt
    const _color = color.toPDFColorString();

    // Background color is optional, so we set the `rg` flag directly here
    const _backgroundColor = backgroundColor
      ? backgroundColor.toPDFColorString() + "\n"
      : "";

    // The `B` draws a filled rect, the `S` draws a stroked rect only
    renderedContent += `${borderWidth} w\n${_color} RG\n${_backgroundColor}${x} ${y} ${width} ${height} re ${
      backgroundColor ? "B" : "S"
    }\n`;
    if (children)
      for (let child of children) {
        // Pick the content of all elements of the page
        const renderer = RendererRegistry.getRenderer(child);
        if (renderer) {
          renderedContent += await renderer(child, objectManager);
        }
      }

    return renderedContent;
  }
}
