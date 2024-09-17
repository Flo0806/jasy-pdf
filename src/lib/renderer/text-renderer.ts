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
    const { x, y, width, fontSize, color, content, fontFamily } =
      textElement.getProps();
    const colorString = color.map((c) => (c / 255).toFixed(3)).join(" ");

    // Private Funktion, um den Content zu rendern
    const renderedContent = TextRenderer._renderContent(
      content,
      fontSize,
      fontFamily,
      objectManager,
      width || Number.NaN
    );

    return `BT ${colorString} rg ${fontSize} TL ${x} ${y} Td ${renderedContent} ET`;
  }

  // Private function to check if content is a string or a `TextSegment[]`
  private static _renderContent(
    content: string | TextSegment[],
    fontSize: number,
    fontFamily: string,
    objectManager: PDFObjectManager,
    maxWidth: number
  ): string {
    let renderedContent = "";

    // This function adds line breaks if needed
    const wrapText = (
      text: string,
      fontFamily: string,
      fontSize: number,
      maxWidth: number
    ): string[] => {
      let currentLine = "";
      let currentWidth = 0;
      const lines: string[] = [];

      // Split the text into words, inclusive empty spaces
      const words = text.split(" ");

      words.forEach((word, index) => {
        // Calc the width of the actual word
        const wordWidth = objectManager.getStringWidth(
          word,
          fontFamily,
          fontSize
        );
        const spaceWidth = objectManager.getCharWidth(
          " ",
          fontFamily,
          fontSize
        );
        console.log(word, wordWidth, maxWidth, currentWidth);

        // Check if the word is to big for the current line
        if (currentWidth + wordWidth > maxWidth) {
          lines.push(currentLine.trim());
          console.log("NEW LINE", currentLine, currentWidth, wordWidth, word);
          currentLine = word;
          currentWidth = wordWidth;
        } else {
          // Add the word to the current line
          currentLine += index === 0 ? word : " " + word;
          currentWidth += wordWidth + spaceWidth; // Update lines current width
        }
      });

      if (currentLine) {
        lines.push(currentLine.trim()); // Add last line
      }

      return lines;
    };

    // If content is a simple string
    if (typeof content === "string") {
      const fontData = objectManager.registerFont(fontFamily);
      const lines = wrapText(content, fontFamily, fontSize, maxWidth);
      console.log(lines);
      return lines
        .map((line, index) => {
          const textCommand = `/F${fontData.fontIndex} ${fontSize} Tf (${line}) Tj`;
          return index === 0 ? textCommand : `T* (${line}) Tj`;
        })
        .join("\n");
    }

    // If content is a array of `TextSegment`
    content.forEach((segment: TextSegment) => {
      const font = objectManager.registerFont(
        segment.fontFamily || fontFamily,
        segment.fontStyle || FontStyle.Normal
      );
      const segmentColor = segment.fontColor
        ? segment.fontColor.map((c) => (c / 255).toFixed(3)).join(" ")
        : "0 0 0"; // Standard color is black

      const lines = wrapText(
        segment.content,
        segment.fontFamily || fontFamily,
        fontSize,
        maxWidth
      );
      renderedContent +=
        lines
          .map(
            (line) =>
              `/F${font.fontIndex} ${fontSize} Tf ${segmentColor} rg (${line}) Tj`
          )
          .join("\n") + "\n";
    });

    return renderedContent.trim();
  }
}
