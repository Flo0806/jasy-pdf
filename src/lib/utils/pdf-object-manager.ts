interface FontIndexes {
  fontIndex: number;
  resourceIndex: number;
}

/**
 * Helper class for the fonts.
 * Fonts are set with the style `F1 2 0 R`. F1 is the index of the fonts only (Courier = 1, Times-Roman = 2)
 * `2 0 R` (so 2) is the index of all resouces we set. So we need a special map and some function to get what we need.
 */
class FontManager {
  private fonts: Map<string, FontIndexes> = new Map();

  // Add font to the array
  addFont(fontName: string, fontIndex: number, resourceIndex: number): void {
    if (!this.fonts.has(fontName)) {
      this.fonts.set(fontName, { fontIndex, resourceIndex });
    }
  }

  // Check if font already exists
  hasFont(fontName: string): boolean {
    return this.fonts.has(fontName);
  }

  // Returns all informations about the font, so indexes and name
  getFont(fontName: string): FontIndexes | undefined {
    return this.fonts.get(fontName);
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
  registerFont(fontName: string): FontIndexes {
    if (this.fonts.hasFont(fontName)) {
      return this.fonts.getFont(fontName)!; // Already added? Return it!
    }

    const resourceNumber = this.objects.length + 1; // The new resource object number
    const fontNumber = this.fonts.getLastFontIndex() + 1; // The new font index number
    this.fonts.addFont(fontName, fontNumber, resourceNumber); // Lets save it

    const fontObject = `<< /Type /Font /Subtype /Type1 /BaseFont /${fontName} >>`;
    this.addObject(fontObject);

    return { fontIndex: fontNumber, resourceIndex: resourceNumber };
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
