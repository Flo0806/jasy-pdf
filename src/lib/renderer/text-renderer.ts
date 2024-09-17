import { fontMetrics } from "../constants/font-metrics";
import { TextElement, TextSegment } from "../elements/text-element";
import { FontStyle, PDFObjectManager } from "../utils/pdf-object-manager";

export class TextRenderer {
  public static calculateTextHeight(
    content: string | TextSegment[],
    fontSize: number,
    fontFamily: string,
    objectManager: PDFObjectManager,
    maxWidth: number
  ): number {
    // This function adds line breaks if needed and returns the number of lines
    const calculateWrappedLines = (
      text: string,
      fontFamily: string,
      fontSize: number,
      maxWidth: number
    ): number => {
      let currentLine = "";
      let currentWidth = 0;
      let lineCount = 0;

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

        // Check if the word is too big for the current line
        if (currentWidth + wordWidth > maxWidth) {
          lineCount += 1; // Add a line break
          currentLine = word;
          currentWidth = wordWidth;
        } else {
          // Add the word to the current line
          currentLine += index === 0 ? word : " " + word;
          currentWidth += wordWidth + spaceWidth; // Update the current line width
        }
      });

      // Add last line if not empty
      if (currentLine) {
        lineCount += 1;
      }

      return lineCount;
    };

    let totalLines = 0;

    // If content is a simple string
    if (typeof content === "string") {
      totalLines += calculateWrappedLines(
        content,
        fontFamily,
        fontSize,
        maxWidth
      );
    }

    // If content is an array of `TextSegment`
    if (Array.isArray(content)) {
      content.forEach((segment: TextSegment) => {
        totalLines += calculateWrappedLines(
          segment.content,
          segment.fontFamily || fontFamily,
          fontSize,
          maxWidth
        );
      });
    }

    // Return the total height based on the number of lines and font size
    const lineHeight = fontSize;
    return totalLines * lineHeight;
  }

  static render(
    textElement: TextElement,
    objectManager: PDFObjectManager
  ): string {
    const { x, y, width, fontSize, color, content, fontFamily } =
      textElement.getProps();
    const colorString = color.map((c) => (c / 255).toFixed(3)).join(" ");

    // Private function to render the content
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

        // Check if the word is to big for the current line
        if (currentWidth + wordWidth > maxWidth) {
          lines.push(currentLine.trim());
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
