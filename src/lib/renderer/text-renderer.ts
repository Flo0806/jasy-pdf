import { TextElement } from "../elements/text-element";
import { PDFObjectManager } from "../utils/pdf-object-manager";

export class TextRenderer {
  static getTextSize(textElement: TextElement): {
    width: number;
    height: number;
  } {
    const { fontSize, content } = textElement.getProps();

    // Wir gehen davon aus, dass jeder Buchstabe ca. 0.6 der Schriftgröße breit ist (kann angepasst werden)
    const averageCharWidthFactor = 0.6;

    const width = content.length * fontSize * averageCharWidthFactor;
    const height = fontSize; // Höhe ist gleich der Schriftgröße

    return { width, height };
  }

  static render(
    textElement: TextElement,
    objectManager: PDFObjectManager
  ): string {
    const { x, y, fontSize, color, content, fontFamily } =
      textElement.getProps();
    const colorString = color.map((c) => (c / 255).toFixed(3)).join(" ");

    const fontData = objectManager.registerFont(fontFamily);

    return `BT /F${fontData.fontIndex} ${fontSize} Tf ${colorString} rg ${x} ${y} Td (${content}) Tj ET`;
  }
}
