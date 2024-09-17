import { PDFObjectManager } from "../utils/pdf-object-manager";

import { RectangleElement } from "../elements/rectangle-element";
import { RendererRegistry } from "../utils/renderer-registry";

export class RectangleRenderer {
  static render(
    rectangleElement: RectangleElement,
    objectManager: PDFObjectManager
  ): string {
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
    const _color = color
      ? color.map((c) => (c / 255).toFixed(3)).join(" ")
      : "0 0 0"; // Standard color is black

    // Background color is optional, so we set the `rg` flag directly here
    const _backgroundColor = backgroundColor
      ? backgroundColor.map((c) => (c / 255).toFixed(3)).join(" ") + " rg\n"
      : "";
    // The `B` draws a filled rect, the `S` draws a stroked rect only
    renderedContent += `${borderWidth} w\n${_color} RG\n${_backgroundColor}${x} ${y} ${width} ${height} re ${
      backgroundColor ? "B" : "S"
    }\n`;
    if (children)
      children.forEach((child) => {
        // Pick the content of all elements of the page
        const renderer = RendererRegistry.getRenderer(child);
        if (renderer) {
          renderedContent += renderer(child, objectManager) + "\n";
        }
      });

    return renderedContent;
  }
}
