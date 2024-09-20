import { fontMetrics } from "../constants/font-metrics";
import { pageFormats } from "../constants/page-sizes";

interface FontIndexes {
  fontIndex: number;
  resourceIndex: number;
  fontStyle: FontStyle;
  fullName: string;
}

export enum FontStyle {
  Normal = "normal",
  Bold = "bold",
  Italic = "italic",
  BoldItalic = "boldItalic",
}

class FontManager {
  private fonts: Map<string, FontIndexes> = new Map();

  addFont(
    fontName: string,
    fontIndex: number,
    resourceIndex: number,
    fontStyle: FontStyle = FontStyle.Normal,
    fullName: string = fontName
  ): void {
    const fontKey = this._createFontKey(fontName, fontStyle);
    if (!this.fonts.has(fontKey)) {
      this.fonts.set(fontKey, {
        fontIndex,
        resourceIndex,
        fontStyle,
        fullName,
      });
    }
  }

  hasFont(fontName: string, fontStyle: FontStyle = FontStyle.Normal): boolean {
    const fontKey = this._createFontKey(fontName, fontStyle);
    return this.fonts.has(fontKey);
  }

  getFont(
    fontName: string,
    fontStyle: FontStyle = FontStyle.Normal
  ): FontIndexes | undefined {
    const fontKey = this._createFontKey(fontName, fontStyle);
    return this.fonts.get(fontKey);
  }

  addCustomFont(
    fontName: string,
    fontStyle: FontStyle,
    fullName: string = fontName
  ): void {
    const fontIndex = this.getLastFontIndex() + 1;
    const resourceIndex = this.getLastResourceIndex() + 1;
    this.addFont(fontName, fontIndex, resourceIndex, fontStyle, fullName);
  }

  getAllFonts(): Map<string, FontIndexes> {
    return this.fonts;
  }

  size(): number {
    return this.fonts.size;
  }

  getLastFontIndex(): number {
    let maxFontIndex = 0;
    this.fonts.forEach((value) => {
      if (value.fontIndex > maxFontIndex) {
        maxFontIndex = value.fontIndex;
      }
    });
    return maxFontIndex;
  }

  getLastResourceIndex(): number {
    let maxResourceIndex = 0;
    this.fonts.forEach((value) => {
      if (value.resourceIndex > maxResourceIndex) {
        maxResourceIndex = value.resourceIndex;
      }
    });
    return maxResourceIndex;
  }

  private _createFontKey(fontName: string, fontStyle: FontStyle): string {
    return `${fontName}-${fontStyle}`;
  }
}

export class PDFObjectManager {
  private objects: string[] = [];
  private objectPositions: number[] = [];
  private parentObjectNumber: number = 0;
  private fonts: FontManager = new FontManager(); // Stores the fonts
  public pageFormat = pageFormats.a4;

  constructor();
  constructor(pageFormat?: number[]) {
    if (pageFormat) this.pageFormat = pageFormat;
  }

  // Adds an object and returns its number
  addObject(content: string): number {
    // The text is encoded in Windows-1252 if necessary
    const objectNumber = this.objects.length + 1;
    const position = this.getCurrentByteLength(); // Calculate the current byte length
    this.objectPositions.push(position);
    this.objects.push(content);
    return objectNumber;
  }

  // Replaces an object at the index `objectNumber`
  replaceObject(objectNumber: number, content: string): void {
    this.objects[objectNumber - 1] = content;
  }

  // Calculates the total length of the document in bytes (for XRef)
  private getCurrentByteLength(): number {
    let length = "%PDF-1.3\n".length; // Start with the header

    for (let i = 0; i < this.objects.length; i++) {
      const obj = this.objects[i];
      const objectContent = `${i + 1} 0 obj\n${obj}\nendobj\n`;

      // Convert the object content into a buffer with the correct encoding
      const encodedContent = Buffer.from(objectContent, "binary");

      // Add the actual byte length to the total length
      length += encodedContent.length;
    }
    return length;
  }

  // Sets the parent object number
  setParentObjectNumber(number: number) {
    this.parentObjectNumber = number;
  }

  // Returns the parent object number
  getParentObjectNumber(): number {
    return this.parentObjectNumber;
  }

  // Registers a font
  registerFont(
    fontName: string,
    fontStyle: FontStyle = FontStyle.Normal,
    fullName: string = fontName
  ): FontIndexes {
    if (this.fonts.hasFont(fontName, fontStyle)) {
      return this.fonts.getFont(fontName, fontStyle)!; // Already exists? Return it!
    }

    const resourceNumber = this.objects.length + 1; // New resource number
    const fontNumber = this.fonts.getLastFontIndex() + 1; // New font index number
    this.fonts.addFont(fontName, fontNumber, resourceNumber, fontStyle); // Store it

    const fontObject = `<</BaseFont/${fullName}/Type/Font\n/Encoding/WinAnsiEncoding\n/Subtype/Type1>>`;
    this.addObject(fontObject);

    return {
      fontIndex: fontNumber,
      resourceIndex: resourceNumber,
      fontStyle: fontStyle,
      fullName: fullName,
    };
  }

  // Calculates the width of a single character based on the font metrics
  getCharWidth(
    char: string,
    fontFamily: keyof typeof fontMetrics,
    fontSize: number
  ): number {
    const font = fontMetrics[fontFamily];
    if (!font) {
      throw new Error(`Font family "${fontFamily}" not found in font metrics.`);
    }

    let charWidth = font[char];
    if (!charWidth) {
      charWidth = font["a"]; // Fallback to 'a'
    }

    const scaleFactor = fontSize / 1000;
    return charWidth * scaleFactor;
  }

  // Calculates the width of a string based on the font metrics
  getStringWidth(
    text: string,
    fontFamily: keyof typeof fontMetrics,
    fontSize: number
  ): number {
    let totalWidth = 0;
    const font = fontMetrics[fontFamily];
    if (!font) {
      throw new Error(`Font family "${fontFamily}" not found in font metrics.`);
    }

    const baseUnit = 1000;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      let charWidth = font[char];
      if (!charWidth) {
        charWidth = font["a"]; // Fallback to 'a'
      }
      totalWidth += (charWidth / baseUnit) * fontSize;
    }

    return totalWidth;
  }

  // Returns all fonts
  getAllFontsRaw() {
    return this.fonts.getAllFonts();
  }

  // Returns all rendered objects as a string
  getRenderedObjects(): string {
    let result = "";
    this.objectPositions = [];
    this.objects.forEach((content, index) => {
      const position = result.length + "%PDF-1.3\n".length; // Calculate positions after the header
      this.objectPositions.push(position);
      result += `${index + 1} 0 obj\n${content}\nendobj\n`;
    });
    return result;
  }

  // Creates the cross-reference table
  getXRefTable(): string {
    let xref = "xref\n";
    xref += `0 ${this.objects.length + 1}\n`;
    xref += `0000000000 65535 f \n`; // Free object

    this.objectPositions.forEach((pos) => {
      xref += `${pos.toString().padStart(10, "0")} 00000 n \n`;
    });

    return xref;
  }

  // Calculates the position of the XRef table and returns the trailer
  getTrailerAndXRef(startxref: number): string {
    const objectCount = this.getObjectCount();
    return `trailer\n<< /Size ${objectCount + 1} /Root ${
      this.objects.findIndex((f) => f.toLowerCase().includes("catalog")) + 1
    } 0 R >>\nstartxref\n${startxref}\n%%EOF`;
  }

  // Returns the number of objects
  getObjectCount(): number {
    return this.objects.length;
  }
}
