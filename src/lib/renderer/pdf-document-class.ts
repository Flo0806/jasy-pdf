import { PDFDocumentElement } from "../elements";
import { FontStyle, PDFObjectManager } from "../utils/pdf-object-manager";
import { InjectObjectManager } from "../utils/pdf-object-manager-decorator";
import { PDFRenderer } from "./pdf-renderer";

export abstract class PDFDocument {
  @InjectObjectManager()
  private _objectManager!: PDFObjectManager;

  private child!: PDFDocumentElement;
  //#region  Helper
  // Method to register all standard fonts
  private registerStandardFonts(objectManager: PDFObjectManager) {
    const standardFonts = [
      {
        fontName: "Helvetica",
        fontStyle: FontStyle.Normal,
        fullName: "Helvetica",
      },
      {
        fontName: "Helvetica",
        fontStyle: FontStyle.Bold,
        fullName: "Helvetica-Bold",
      },
      {
        fontName: "Helvetica",
        fontStyle: FontStyle.Italic,
        fullName: "Helvetica-Oblique",
      },
      {
        fontName: "Helvetica",
        fontStyle: FontStyle.BoldItalic,
        fullName: "Helvetica-BoldOblique",
      },

      { fontName: "Courier", fontStyle: FontStyle.Normal, fullName: "Courier" },
      {
        fontName: "Courier",
        fontStyle: FontStyle.Bold,
        fullName: "Courier-Bold",
      },
      {
        fontName: "Courier",
        fontStyle: FontStyle.Italic,
        fullName: "Courier-Oblique",
      },
      {
        fontName: "Courier",
        fontStyle: FontStyle.BoldItalic,
        fullName: "Courier-BoldOblique",
      },

      {
        fontName: "Times-Roman",
        fontStyle: FontStyle.Normal,
        fullName: "Times-Roman",
      },
      {
        fontName: "Times-Roman",
        fontStyle: FontStyle.Bold,
        fullName: "Times-Bold",
      },
      {
        fontName: "Times-Roman",
        fontStyle: FontStyle.Italic,
        fullName: "Times-Italic",
      },
      {
        fontName: "Times-Roman",
        fontStyle: FontStyle.BoldItalic,
        fullName: "Times-BoldItalic",
      },

      {
        fontName: "Symbol",
        fontStyle: FontStyle.Normal,
        fullName: "Symbol",
      },

      {
        fontName: "ITC Zapf Dingbats",
        fontStyle: FontStyle.Normal,
        fullName: "ZapfDingbats",
      },
    ];

    standardFonts.forEach((font) =>
      objectManager.registerFont(font.fontName, font.fontStyle, font.fullName)
    );
  }
  //#endregion
  constructor() {
    // Add all standard font families
    this.registerStandardFonts(this._objectManager);
  }

  get objectManager() {
    return this._objectManager;
  }

  abstract build(): PDFDocumentElement;

  public static render<T extends PDFDocument>(this: new () => T): string {
    const instance = new this();
    instance.child = instance.build();
    return PDFRenderer.render(instance.child);
  }
}
