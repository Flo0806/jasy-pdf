import { TextElement, TextSegment } from "../elements/text-element";
import { FontStyle, PDFObjectManager } from "../utils/pdf-object-manager";

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

    // Private Funktion, um den Content zu rendern
    const renderedContent = this._renderContent(
      content,
      fontSize,
      fontFamily,
      objectManager
    );

    return `BT ${colorString} rg ${x} ${y} Td ${renderedContent} ET`;
  }

  // Private function to check if content is a string or a `TextSegment[]`
  private static _renderContent(
    content: string | TextSegment[],
    fontSize: number,
    fontFamily: string,
    objectManager: PDFObjectManager
  ): string {
    // A simple text string?
    if (typeof content === "string") {
      const fontData = objectManager.registerFont(fontFamily);
      return `/F${fontData.fontIndex} ${fontSize} Tf (${content}) Tj`;
    }

    // A `TextSegment[]`?
    let renderedSegments = "";
    content.forEach((segment: TextSegment) => {
      const font = objectManager.registerFont(
        segment.fontFamily || fontFamily,
        segment.fontStyle || FontStyle.Normal
      );
      const segmentColor = segment.fontColor
        ? segment.fontColor.map((c) => (c / 255).toFixed(3)).join(" ")
        : "0 0 0"; // Default is black TODO: Set a global variable to set a standard color for the document!!

      renderedSegments += `/F${font.fontIndex} ${fontSize} Tf ${segmentColor} rg (${segment.content}) Tj `;
    });

    return renderedSegments.trim();
  }
}
