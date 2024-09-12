import { fontMetrics } from "../constants/font-metrics";

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

/**
 * Helper class for the fonts.
 * Fonts are set with the style `F1 2 0 R`. F1 is the index of the fonts only (Courier = 1, Times-Roman = 2)
 * `2 0 R` (so 2) is the index of all resouces we set. So we need a special map and some function to get what we need.
 */
class FontManager {
  private fonts: Map<string, FontIndexes> = new Map();

  // Add font to the array
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

  // Check if font already exists
  hasFont(fontName: string, fontStyle: FontStyle = FontStyle.Normal): boolean {
    const fontKey = this._createFontKey(fontName, fontStyle);
    return this.fonts.has(fontKey);
  }

  // Returns all informations about the font, so indexes and name
  getFont(
    fontName: string,
    fontStyle: FontStyle = FontStyle.Normal
  ): FontIndexes | undefined {
    const fontKey = this._createFontKey(fontName, fontStyle);
    return this.fonts.get(fontKey);
  }

  // Fügt eine benutzerdefinierte Schriftart hinzu (späterer Ausbau für Bytecode usw.)
  addCustomFont(
    fontName: string,
    fontStyle: FontStyle,
    fullName: string = fontName
  ): void {
    const fontIndex = this.getLastFontIndex() + 1;
    const resourceIndex = this.getLastResourceIndex() + 1;
    this.addFont(fontName, fontIndex, resourceIndex, fontStyle, fullName);
  }

  // Returns all fonts
  getAllFonts(): Map<string, FontIndexes> {
    return this.fonts;
  }

  // Returns the size of the fonts array
  size(): number {
    return this.fonts.size;
  }

  // Returns the highest font index of all fonts
  getLastFontIndex(): number {
    let maxFontIndex = 0;
    this.fonts.forEach((value) => {
      if (value.fontIndex > maxFontIndex) {
        maxFontIndex = value.fontIndex;
      }
    });
    return maxFontIndex;
  }

  // Returns the highest resource index of all fonts
  getLastResourceIndex(): number {
    let maxResourceIndex = 0;
    this.fonts.forEach((value) => {
      if (value.resourceIndex > maxResourceIndex) {
        maxResourceIndex = value.resourceIndex;
      }
    });
    return maxResourceIndex;
  }

  // Private Methode zur Erstellung eines eindeutigen Schlüssels für Schriftart + Stil
  private _createFontKey(fontName: string, fontStyle: FontStyle): string {
    return `${fontName}-${fontStyle}`;
  }
}

export class PDFObjectManager {
  private objects: string[] = [];
  private objectPositions: number[] = [];
  private parentObjectNumber: number = 0;
  private fonts: FontManager = new FontManager(); // Save the fonts we're using in the pdf document

  // Add an object and return its number
  addObject(content: string): number {
    const objectNumber = this.objects.length + 1;
    const position = this.getCurrentByteLength(); // We need all the positions caluclated... here we calc it
    this.objectPositions.push(position);
    this.objects.push(content);
    return objectNumber;
  }

  // Replace a object on index `objectNumber` with new content
  replaceObject(objectNumber: number, content: string): void {
    this.objects[objectNumber - 1] = content;
  }

  // Calculates the size of the document in bytes (for XRef)
  private getCurrentByteLength(): number {
    let length = "%PDF-1.4\n".length; // Start with the header - we need the complete size!
    this.objects.forEach((obj, index) => {
      length += `${index + 1} 0 obj\n${obj}\nendobj\n`.length;
    });
    return length;
  }

  // Set the parent object
  setParentObjectNumber(number: number) {
    this.parentObjectNumber = number;
  }

  // Get the parent object
  getParentObjectNumber(): number {
    return this.parentObjectNumber;
  }

  // Register a font family
  registerFont(
    fontName: string,
    fontStyle: FontStyle = FontStyle.Normal,
    fullName: string = fontName
  ): FontIndexes {
    if (this.fonts.hasFont(fontName, fontStyle)) {
      return this.fonts.getFont(fontName, fontStyle)!; // Already added? Return it!
    }

    const resourceNumber = this.objects.length + 1; // The new resource object number
    const fontNumber = this.fonts.getLastFontIndex() + 1; // The new font index number
    this.fonts.addFont(fontName, fontNumber, resourceNumber, fontStyle); // Lets save it

    const fontObject = `<< /Type /Font /Subtype /Type1 /BaseFont /${fullName} >>`;
    this.addObject(fontObject);

    return {
      fontIndex: fontNumber,
      resourceIndex: resourceNumber,
      fontStyle: fontStyle,
      fullName: fullName,
    };
  }

  getCharWidth(
    char: string,
    fontFamily: keyof typeof fontMetrics,
    fontSize: number
  ): number {
    // Überprüfen, ob die Schriftfamilie und das Zeichen in den fontMetrics vorhanden sind
    const font = fontMetrics[fontFamily];
    if (!font) {
      throw new Error(`Font family "${fontFamily}" not found in font metrics.`);
    }

    // Wenn das Zeichen nicht im Font-Metrics-Objekt ist, verwende eine Standardbreite (z.B. für nicht definierte Zeichen)
    const charWidth = font[char] || font["a"]; // Nutze eine Standardbreite für unbekannte Zeichen (z.B. die Breite von 'a')

    // Berechne die Zeichenbreite unter Berücksichtigung der Schriftgröße
    const scaleFactor = fontSize / 1000;
    return charWidth * scaleFactor;
  }

  testText = "Start";
  getTestText() {
    return this.testText;
  }

  setTestText(text: string) {
    this.testText = text;
  }

  getStringWidth(text: string, fontFamily: string, fontSize: number): number {
    let totalWidth = 0;

    const font = fontMetrics[fontFamily];
    if (!font) {
      throw new Error(`Font family "${fontFamily}" not found in font metrics.`);
    }

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const charWidth = font[char] || font["a"]; // Nutze eine Standardbreite für unbekannte Zeichen (z.B. die Breite von 'a')

      totalWidth += (charWidth / 1000) * fontSize; // Schriftgrößenfaktor
    }

    return totalWidth;
  }

  getAllFontsRaw() {
    return this.fonts.getAllFonts();
  }

  // Returns all rendered objects as string
  getRenderedObjects(): string {
    let result = "";
    this.objectPositions = [];
    this.objects.forEach((content, index) => {
      const position = result.length + "%PDF-1.4\n".length; // Calculation the positions after the header
      this.objectPositions.push(position); // And hold it
      result += `${index + 1} 0 obj\n${content}\nendobj\n`;
    });
    return result;
  }

  // Returns the Cross-Reference table
  getXRefTable(): string {
    let xref = "xref\n";
    xref += `0 ${this.objects.length + 1}\n`;
    xref += `0000000000 65535 f \n`; // Free object

    this.objectPositions.forEach((pos) => {
      xref += `${pos.toString().padStart(10, "0")} 00000 n \n`;
    });

    return xref;
  }

  // Calculating the position of the XRef table and returns the trailer
  getTrailerAndXRef(startxref: number): string {
    const objectCount = this.getObjectCount();
    return `trailer\n<< /Size ${objectCount + 1} /Root ${
      this.objects.findIndex((f) => f.toLowerCase().includes("catalog")) + 1
    } 0 R >>\nstartxref\n${startxref}\n%%EOF`;
  }

  // Returns the object count
  getObjectCount(): number {
    return this.objects.length;
  }
}
