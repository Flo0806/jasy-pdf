import { fontMetrics } from "../constants/font-metrics";
import { TextElement, TextSegment } from "../elements/text-element";
import { FontStyle, PDFObjectManager } from "../utils/pdf-object-manager";

export class TextRenderer {
  // //#region Helper
  // private static calculateWidthForString(
  //   text: string,
  //   fontFamily: string,
  //   fontStyle: FontStyle,
  //   fontSize: number
  // ): number {
  //   let totalWidth = 0;

  //   // Look up the font metrics for the font family and style
  //   const metrics = fontMetrics[`${fontFamily}-${fontStyle}`];

  //   if (!metrics) {
  //     throw new Error(`Font metrics not found for ${fontFamily}-${fontStyle}`);
  //   }

  //   // Iterate over each character in the string
  //   for (const char of text) {
  //     const advanceWidth = metrics[char] || metrics["default"]; // Fallback to 'default' width if char not found
  //     const scaledWidth = (advanceWidth / 1000) * fontSize; // Scale the advance width by the font size
  //     totalWidth += scaledWidth;
  //   }

  //   return totalWidth;
  // }
  // //#endregion

  // static getTextSize(textElement: TextElement): {
  //   width: number;
  //   height: number;
  // } {
  //   const {
  //     fontSize,
  //     content,
  //     fontFamily,
  //     fontStyle = FontStyle.Normal,
  //   } = textElement.getProps();

  //   // Initialize total width
  //   let totalWidth = 0;
  //   let currentFontFamily = fontFamily;
  //   let currentFontStyle = fontStyle;

  //   if (typeof content === "string") {
  //     // Simple string case
  //     totalWidth = this.calculateWidthForString(
  //       content,
  //       fontFamily,
  //       fontStyle,
  //       fontSize
  //     );
  //   } else {
  //     // TextSegment[] case
  //     content.forEach((segment: TextSegment) => {
  //       const segmentFontFamily = segment.fontFamily || currentFontFamily;
  //       const segmentFontStyle = segment.fontStyle || currentFontStyle;

  //       totalWidth += this.calculateWidthForString(
  //         segment.content,
  //         segmentFontFamily,
  //         segmentFontStyle,
  //         fontSize
  //       );
  //     });
  //   }

  //   // The height is simply the font size
  //   const height = fontSize;

  //   return { width: totalWidth, height };
  // }

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
    console.log(content);
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
