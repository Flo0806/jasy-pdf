import { PDFObjectManager } from "../utils/pdf-object-manager";

import { RendererRegistry } from "../utils/renderer-registry";
import { LineElement } from "../elements";

export class LineRenderer {
  static async render(
    LineElement: LineElement,
    objectManager: PDFObjectManager
  ): Promise<string> {
    const { x, y, xEnd, yEnd, color, strokeWidth } = LineElement.getProps();
    let renderedContent = "";

    // Beginne das Zeichnen eines Rechtecks, das die Größe der Box darstellt
    const _color = color
      ? color.map((c) => (c / 255).toFixed(3)).join(" ")
      : "0 0 0"; // Standard color is black

    renderedContent += `q
${strokeWidth} w
${_color} RG
[] 0 d
${x} ${y} m
${xEnd} ${yEnd} l
S
Q`;

    return renderedContent;
  }
}
