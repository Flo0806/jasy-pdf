import { pageFormats } from "../constants/page-sizes";
import * as fs from "fs";
import * as path from "path";
import { AFMParser } from "./afm-parser";

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

class ImageManager {
  private images: Map<string, number> = new Map();

  addImage(resourceNumber: number) {
    this.images.set("IM" + resourceNumber.toString(), resourceNumber);
  }

  getAllImages() {
    return this.images;
  }
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
  private images: ImageManager = new ImageManager(); // Stores the images (object numbers and names)
  public pageFormat = pageFormats.a4;

  private afmParsers: {
    fontName: string;
    fontStyle: FontStyle;
    fullFontName?: string;
    parser: AFMParser;
  }[] = [];

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
    let length = "%PDF-1.4\n".length; // Start with the header

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

  atob(data: string) {
    var b64 =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    //  discuss at: http://phpjs.org/functions/base64_decode/
    // original by: Tyler Akins (http://rumkin.com)
    // improved by: Thunder.m
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    //    input by: Aman Gupta
    //    input by: Brett Zamir (http://brett-zamir.me)
    // bugfixed by: Onno Marsman
    // bugfixed by: Pellentesque Malesuada
    // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    //   example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
    //   returns 1: 'Kevin van Zonneveld'

    var o1,
      o2,
      o3,
      h1,
      h2,
      h3,
      h4,
      bits,
      i = 0,
      ac = 0,
      dec = "",
      tmp_arr = [];

    if (!data) {
      return data;
    }

    data += "";

    do {
      // unpack four hexets into three octets using index points in b64
      h1 = b64.indexOf(data.charAt(i++));
      h2 = b64.indexOf(data.charAt(i++));
      h3 = b64.indexOf(data.charAt(i++));
      h4 = b64.indexOf(data.charAt(i++));

      bits = (h1 << 18) | (h2 << 12) | (h3 << 6) | h4;

      o1 = (bits >> 16) & 0xff;
      o2 = (bits >> 8) & 0xff;
      o3 = bits & 0xff;

      if (h3 == 64) {
        tmp_arr[ac++] = String.fromCharCode(o1);
      } else if (h4 == 64) {
        tmp_arr[ac++] = String.fromCharCode(o1, o2);
      } else {
        tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
      }
    } while (i < data.length);

    dec = tmp_arr.join("");

    return dec;
  }

  // Registers an image
  registerImage(
    width: number,
    height: number,
    imageType: string,
    imageData: string
  ) {
    const imageObject = `<< /Type /XObject
    /Subtype /Image
    /Width ${width}
    /Height ${height}
    /ColorSpace /DeviceRGB
    /BitsPerComponent 8
    /Filter /${imageType}
    /Length ${imageData.length} >>
stream
${imageData} 
endstream`;

    //     // Bilddaten im Binärformat einlesen
    //     const imageDataTest = fs.readFileSync(
    //       "C:\\Users\\fh\\Downloads\\face.jpg"
    //       // "binary"
    //     );

    //     // Länge der Binärdaten
    //     const imageLength = imageDataTest.length;

    //     // PDF-Objekt erstellen
    //     const pdfObject = `<< /Type /XObject
    //    /Subtype /Image
    //    /Width 123
    //    /Height 111
    //    /ColorSpace /DeviceRGB
    //    /BitsPerComponent 8
    //    /Filter /DCTDecode
    //    /Length ${imageLength} >>
    // stream
    // ${imageDataTest.toString("latin1")}
    // endstream`;

    // Add the image and its object number to the image manager - return the object number
    const imageObjectNumber = this.addObject(imageObject);

    this.images.addImage(imageObjectNumber);
    return imageObjectNumber;
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

    const afmFilePath = path.resolve(
      __dirname,
      "../",
      `assets/${fullName}.afm`
    );
    if (fs.existsSync(afmFilePath)) {
      const data = fs.readFileSync(afmFilePath, "utf-8");
      this.afmParsers.push({
        fontName,
        fontStyle,
        fullFontName: fullName,
        parser: new AFMParser(data),
      });
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

  // Returns the current width of a text, included kernings
  public getStringWidth(
    text: string,
    fontFamily: string,
    fontSize: number,
    fontStyle: FontStyle
  ): number {
    let width = 0;

    // We must calculate each sign
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1] || null;

      // Get signs width
      const charWidth = this.getCharWidth(
        char,
        fontSize,
        undefined,
        fontFamily,
        fontStyle
      );
      width += charWidth;

      // If a next sign available calculate the kerning
      if (nextChar) {
        const kerning = this.getKerning(
          char,
          nextChar,
          undefined,
          fontFamily,
          fontStyle
        );
        width += kerning * fontSize; // Kerning must be scaled with the font size
      }
    }

    return width;
  }

  private getCharCode(char: string): string {
    return char.charCodeAt(0).toString();
  }

  private getAVMParserByFont(
    fullFontName?: string,
    fontName?: string,
    fontStyle?: FontStyle
  ) {
    if (!fullFontName && (!fontName || !fontStyle)) {
      throw new Error(
        "No font family is given. Please set a full font name or a font with font style"
      );
    }
    let result;
    if (fullFontName) {
      result = this.afmParsers.find((f) => f.fullFontName === fullFontName);
    } else {
      result = this.afmParsers.find(
        (f) => f.fontName === fontName && f.fontStyle === fontStyle
      );
    }

    if (!result)
      throw new Error(
        `Cannot find a parser for the given font family ${
          fullFontName || fontName || "No given font"
        }`
      );

    return result;
  }

  // Methode zur Berechnung der Zeichenbreite anhand der Schriftgröße
  getCharWidth(
    char: string,
    fontSize: number,
    fullFontName?: string,
    fontName?: string,
    fontStyle?: FontStyle
  ): number {
    const currentParser = this.getAVMParserByFont(
      fullFontName,
      fontName,
      fontStyle
    );

    const advanceWidth = currentParser.parser.getAdvanceWidth(char);

    // Normally we got still zero. TODO: Return a alternative width like the "space"
    if (!advanceWidth) {
      throw new Error(
        `Kein Metrik-Eintrag für Zeichen: ${char} ${this.getCharCode(char)}`
      );
    }

    // Width of the character multiplied by the font size (scaled proportionally)
    return (advanceWidth / 1000) * fontSize;
  }

  // Method to get the kerning, if available, between two signs
  private getKerning(
    char: string,
    nextChar: string,
    fullFontName?: string,
    fontName?: string,
    fontStyle?: FontStyle
  ): number {
    const currentParser = this.getAVMParserByFont(
      fullFontName,
      fontName,
      fontStyle
    );

    return currentParser.parser.getKerning(char, nextChar) / 1000;
  }

  // Returns all fonts
  getAllFontsRaw() {
    return this.fonts.getAllFonts();
  }

  // Returns all images
  getAllImagesRaw() {
    return this.images.getAllImages();
  }

  // Returns all rendered objects as a string
  getRenderedObjects(): string {
    let result = "";
    this.objectPositions = [];
    this.objects.forEach((content, index) => {
      const position = result.length + "%PDF-1.4\n".length; // Calculate positions after the header
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
