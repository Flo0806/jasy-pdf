import { HorizontalAlignment } from "../elements/pdf-element";
import { TextElement, TextSegment } from "../elements/text-element";
import { FontStyle, PDFObjectManager } from "../utils/pdf-object-manager";

export class TextRenderer {
  public static calculateTextHeight(
    content: string | TextSegment[],
    fontSize: number,
    fontFamily: string,
    fontStyle: FontStyle,
    objectManager: PDFObjectManager,
    maxWidth: number
  ): number {
    const calculateWrappedLineHeightForSegments = (
      textSegments: TextSegment[],
      maxWidth: number
    ): number => {
      let currentLineWidth = 0;
      let lineHeight = 0;
      let maxFontSizeinLine = 0;

      textSegments.forEach((segment) => {
        const _fontFamily = segment.fontFamily || fontFamily;
        const _fontSize = segment.fontSize || fontSize;
        const _fontStyle = segment.fontStyle || fontStyle;
        const spaceWidth = objectManager.getCharWidth(
          " ",
          _fontSize,
          undefined,
          _fontFamily,
          _fontStyle
        );
        if (maxFontSizeinLine < _fontSize) maxFontSizeinLine = _fontSize;

        // Split the segment content into words
        const words = segment.content.split(" ");

        words.forEach((word, index) => {
          // Calculate the current string width by afm and its kernings
          const wordWidth = objectManager.getStringWidth(
            word,
            _fontFamily,
            _fontSize,
            _fontStyle
          );

          // Check if the current length is too big for the current line
          if (currentLineWidth + wordWidth > maxWidth) {
            lineHeight += maxFontSizeinLine;
            currentLineWidth = wordWidth; // Save all and create a new line
            maxFontSizeinLine = segment.fontSize || fontSize;
          } else {
            // No? Add the word to the current line
            currentLineWidth += wordWidth + spaceWidth;
          }
        });
      });

      // Is still text available, add the line height
      if (currentLineWidth > 0) {
        lineHeight += maxFontSizeinLine;
      }

      return lineHeight;
    };

    // This function adds line breaks if needed and returns the number of lines
    const calculateWrappedLineHeight = (
      text: string,
      fontFamily: string,
      fontSize: number,
      maxWidth: number
    ): number => {
      let currentLine = "";
      let currentWidth = 0;
      let lineHeight = 0;

      // Split the text into words, inclusive empty spaces
      const words = text.split(" ");

      words.forEach((word, index) => {
        // Calc the width of the actual word
        const wordWidth = objectManager.getStringWidth(
          word,
          fontFamily,
          fontSize,
          fontStyle
        );
        const spaceWidth = objectManager.getCharWidth(
          " ",
          fontSize,
          undefined,
          fontFamily,
          fontStyle
        );

        // Check if the word is too big for the current line
        if (currentWidth + wordWidth > maxWidth) {
          lineHeight += fontSize; // Add a line break
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
        lineHeight += fontSize;
      }

      return lineHeight;
    };

    let totalLinesHeight = 0;

    // If content is a simple string
    if (typeof content === "string") {
      totalLinesHeight += calculateWrappedLineHeight(
        content,
        fontFamily,
        fontSize,
        maxWidth
      );
    }

    // If content is an array of `TextSegment`
    if (Array.isArray(content)) {
      totalLinesHeight = calculateWrappedLineHeightForSegments(
        content as TextSegment[],
        maxWidth
      );
    }

    // Return the total height based on the number of lines and font size
    return totalLinesHeight;
  }

  static render(
    textElement: TextElement,
    objectManager: PDFObjectManager
  ): string {
    const {
      x,
      y,
      width,
      fontSize,
      color,
      content,
      fontFamily,
      fontStyle,
      textAlignment,
    } = textElement.getProps();
    const colorString = color.map((c) => (c / 255).toFixed(3)).join(" ");

    // Private function to render the content
    const renderedContent = TextRenderer._renderContent(
      content,
      fontSize,
      fontFamily,
      fontStyle,
      objectManager,
      width || Number.NaN,
      textAlignment,
      width || 0,
      x,
      y
    );

    return `BT\n ${colorString} rg ${renderedContent.maxFontSize} TL ${renderedContent.content} ET\n`;
  }

  // Private function to check if content is a string or a `TextSegment[]`
  private static _renderContent(
    content: string | TextSegment[],
    fontSize: number,
    fontFamily: string,
    fontStyle: FontStyle,
    objectManager: PDFObjectManager,
    maxWidth: number,
    textAlignment: HorizontalAlignment, // New alignment parameter
    pageWidth: number, // Page width to calculate alignment
    initialX: number, // Original x position for left alignment
    yPosition: number
  ): { content: string; maxFontSize: number } {
    // Function to wrap text with word breaks
    const wrapText = (
      text: string,
      fontFamily: string,
      fontSize: number,
      fontStyle: FontStyle,
      maxWidth: number
    ): string[] => {
      let currentLine = "";
      let currentWidth = 0;
      const lines: string[] = [];

      const words = text.split(" ");

      words.forEach((word, index) => {
        const wordWidth = objectManager.getStringWidth(
          word,
          fontFamily,
          fontSize,
          fontStyle
        );
        const spaceWidth = objectManager.getCharWidth(
          " ",
          fontSize,
          undefined,
          fontFamily,
          fontStyle
        );

        if (currentWidth + wordWidth > maxWidth) {
          lines.push(currentLine.trim());
          currentLine = word;
          currentWidth = wordWidth;
        } else {
          currentLine += index === 0 ? word : " " + word;
          currentWidth += wordWidth + spaceWidth;
        }
      });

      if (currentLine) {
        lines.push(currentLine.trim());
      }

      return lines;
    };

    const generateTextCommand = (
      text: string,
      xPosition: number, // We calculated the x position by the current text alignment - use it here
      yPosition: number,
      fontFamily: string,
      fontSize: number,
      maxFontSize: number,
      fontStyle: FontStyle,
      addPosition: boolean,
      fontColor?: [number, number, number]
    ): string => {
      // Get the currunt font from PDF Object Manager
      const fontData = objectManager.registerFont(fontFamily, fontStyle);

      // Setze die Schriftfarbe (falls vorhanden, sonst Standardfarbe)
      let colorCommand = "";
      if (fontColor) {
        const [r, g, b] = fontColor;
        colorCommand = `${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(
          b / 255
        ).toFixed(3)} rg\n`; // Change text color
      }

      // Generiere den finalen PDF-Befehl für das Segment
      let result = `${colorCommand}/F${fontData.fontIndex} ${fontSize} Tf ${maxFontSize} TL`;

      // Position the text only if addPosition is true
      if (addPosition) {
        result += ` ${xPosition.toFixed(3)} ${yPosition.toFixed(3)} Td`;
      }

      // Add the actual text
      result += ` (${text}) Tj\n`;
      return result;
    };

    const renderLine = (
      lineSegments: { lineWidth: number; segments: TextSegment[] },
      initialX: number,
      yPosition: number,
      maxWidth: number,
      textAlignment: HorizontalAlignment,
      addPositions: boolean,
      maxFontSize: number,
      fontFamily: string,
      fontSize: number
    ): string => {
      let lineWidth = 0;
      let lineCommand = "";

      lineWidth = lineSegments.lineWidth;

      // Adjust initialX based on the alignment of the entire line
      let adjustedX = initialX;
      if (textAlignment === HorizontalAlignment.center) {
        adjustedX = initialX + (maxWidth - lineWidth) / 2;
      } else if (textAlignment === HorizontalAlignment.right) {
        adjustedX = initialX + maxWidth - lineWidth;
      }

      // Render each segment in the line with the adjusted X position
      lineSegments.segments.forEach((segment, index) => {
        lineCommand += generateTextCommand(
          segment.content,
          adjustedX,
          yPosition,
          segment.fontFamily || fontFamily,
          segment.fontSize || fontSize,
          maxFontSize,
          segment.fontStyle || fontStyle,
          addPositions && index === 0,
          segment.fontColor
        );

        adjustedX += objectManager.getStringWidth(
          segment.content,
          segment.fontFamily || fontFamily,
          segment.fontSize || fontSize,
          segment.fontStyle || fontStyle
        );
      });

      return lineCommand;
    };

    const renderTextSegments = (
      textSegments: TextSegment[],
      maxWidth: number,
      initialX: number,
      yPosition: number,
      textAlignment: HorizontalAlignment,
      fontFamily: string,
      fontSize: number,
      fontStyle: FontStyle
    ): { content: string; maxFontSize: number } => {
      let commands = "";
      let currentLineWidth = 0;
      let currentX = initialX;
      let maxFontSize = fontSize;
      let currentLineSegments: { lineWidth: number; segments: TextSegment[] } =
        { lineWidth: 0, segments: [] }; // Store segments for the current line

      let combinedSegment = "";
      let firstLine = true;
      textSegments.forEach((segment) => {
        const _fontFamily = segment.fontFamily || fontFamily;
        const _fontSize = segment.fontSize || fontSize;
        const _fontStyle = segment.fontStyle || fontStyle;
        const words = segment.content.split(" ");

        const spaceWidth = objectManager.getCharWidth(
          " ",
          _fontSize,
          undefined,
          _fontFamily,
          _fontStyle
        );

        currentLineSegments.segments.push({
          ...segment,
          fontFamily: _fontFamily,
        });
        combinedSegment = "";

        if (maxFontSize < _fontSize) maxFontSize = _fontSize;

        words.forEach((word, wordIndex) => {
          const wordWidth = objectManager.getStringWidth(
            word,
            _fontFamily,
            _fontSize,
            _fontStyle
          );

          if (currentLineWidth + wordWidth > maxWidth) {
            // Render the collected segments for the current line before starting a new line
            commands += renderLine(
              currentLineSegments,
              currentX,
              yPosition,
              maxWidth,
              textAlignment,
              firstLine || textAlignment !== HorizontalAlignment.left,
              maxFontSize,
              _fontFamily,
              _fontSize
            );
            // If alignment is left we using `T*` for line break. Otherwise we must set the position
            // manually by hand, so we use `ET` and `BT` to create a new text element.
            if (textAlignment !== HorizontalAlignment.left)
              commands += "ET \nBT\n"; // Line break
            else commands += "T*\n";

            // Update position for the next line
            currentLineSegments.lineWidth = currentLineWidth;
            yPosition -= maxFontSize;
            currentX = initialX;
            currentLineWidth = 0;
            currentLineSegments = { lineWidth: 0, segments: [] }; // Clear current line segments
            combinedSegment = "";

            // Add the current word to the new line
            combinedSegment += word;
            currentLineWidth += wordWidth + spaceWidth;
            currentLineSegments.segments.push({
              ...segment,
              content: combinedSegment,
            });
            firstLine = false;
          } else {
            combinedSegment += wordIndex === 0 ? word : " " + word;
            currentLineWidth += wordWidth + spaceWidth;
            if (currentLineSegments.segments.length === 0) {
              currentLineSegments.segments.push({
                ...segment,
                fontFamily: _fontFamily,
                content: combinedSegment,
              });
            }
            currentLineSegments.segments[
              currentLineSegments.segments.length - 1
            ].content = combinedSegment;
            currentLineSegments.lineWidth = currentLineWidth;
          }
        });
      });

      // Render the last collected line
      if (currentLineSegments.segments.length > 0) {
        commands += renderLine(
          currentLineSegments,
          currentX,
          yPosition,
          maxWidth,
          textAlignment,
          firstLine || textAlignment !== HorizontalAlignment.left,
          maxFontSize,
          fontFamily,
          fontSize
        );
      }

      return { content: commands, maxFontSize };
    };

    const alignText = (
      line: string,
      fontFamily: string,
      fontSize: number,
      fontStyle: FontStyle,
      maxWidth: number
    ) => {
      const lineWidth = objectManager.getStringWidth(
        line,
        fontFamily,
        fontSize,
        fontStyle
      );

      // Calculate new x position based on alignment
      let xPosition = initialX;

      if (textAlignment === HorizontalAlignment.center) {
        xPosition = initialX + (maxWidth - lineWidth) / 2;
      } else if (textAlignment === HorizontalAlignment.right) {
        xPosition = initialX + maxWidth - lineWidth;
      }

      return +xPosition.toFixed(3);
    };

    // Handle simple string content
    if (typeof content === "string") {
      const fontData = objectManager.registerFont(fontFamily, fontStyle);
      const lines = wrapText(
        content,
        fontFamily,
        fontSize,
        fontStyle,
        maxWidth
      );

      return {
        content: lines
          .map((line, index) => {
            const xPosition = alignText(
              line,
              fontFamily,
              fontSize,
              fontStyle,
              maxWidth
            );
            const textCommand = `/F${
              fontData.fontIndex
            } ${fontSize} Tf ${xPosition} ${
              yPosition - fontSize * index
            } Td (${line}) Tj`;
            // return index === 0 ? textCommand : `T* (${line}) Tj`;
            return index === 0
              ? textCommand
              : textAlignment === HorizontalAlignment.left
              ? `T* (${line}) Tj`
              : `ET\nBT\n${textCommand}`;
          })
          .join("\n"),
        maxFontSize: fontSize,
      };
    }

    return renderTextSegments(
      content,
      maxWidth,
      initialX,
      yPosition,
      textAlignment,
      fontFamily,
      fontSize,
      fontStyle
    );
  }
}
