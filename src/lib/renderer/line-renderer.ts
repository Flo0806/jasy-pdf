import { PDFObjectManager } from "../utils/pdf-object-manager";
import { LineElement } from "../elements";

export class LineRenderer {
  static async render(
    LineElement: LineElement,
    objectManager: PDFObjectManager
  ): Promise<string> {
    const { x, y, xEnd, yEnd, color, strokeWidth } = LineElement.getProps();
    let renderedContent = "";

    // Convert to coloer...
    const _color = color?.toPDFColorString();

    renderedContent += `q
${strokeWidth} w
${_color} RG
[] 0 d
${x} ${y} m
${xEnd} ${y + yEnd!} l
S
Q
`;

    return renderedContent;
  }
}
