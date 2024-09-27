import { describe, it, expect, vitest } from "vitest";
import { PDFObjectManager, FontStyle } from "./pdf-object-manager";
import { AFMParser } from "./afm-parser";
import * as fs from "fs";

describe("PDFObjectManager", () => {
  it("should add and return the correct object number", () => {
    const manager = new PDFObjectManager();
    const objectNumber = manager.addObject("First object");
    expect(objectNumber).toBe(1);
  });

  it("should replace the object at the correct index", () => {
    const manager = new PDFObjectManager();
    const objectNumber = manager.addObject("First object");
    manager.replaceObject(objectNumber, "Updated object");

    const renderedObjects = manager.getRenderedObjects();
    expect(renderedObjects).toContain("Updated object");
  });

  it("should return the correct rendered objects as a string", () => {
    const manager = new PDFObjectManager();
    manager.addObject("First object");
    manager.addObject("Second object");

    const renderedObjects = manager.getRenderedObjects();
    expect(renderedObjects).toContain("First object");
    expect(renderedObjects).toContain("Second object");
  });
});

describe("PDFObjectManager - Fonts", () => {
  it("should register a font and return correct font indexes", () => {
    const manager = new PDFObjectManager();
    const font = manager.registerFont("Helvetica", FontStyle.Normal);

    expect(font.fontIndex).toBe(1);
    expect(font.resourceIndex).toBe(1);
  });

  it("should return the correct string width with mocked char width and kerning", () => {
    const manager = new PDFObjectManager();
    manager.registerFont("Helvetica", FontStyle.Normal);

    // Mock the getCharWidth method for predictable results
    vitest.spyOn(manager, "getCharWidth").mockReturnValue(600);

    // Mock the getKerning method to simulate kerning between 'A' and 'V'
    vitest
      .spyOn(manager as any, "getKerning")
      .mockImplementation((char, nextChar) => {
        if (char === "A" && nextChar === "V") {
          return 0.1; // Simulated kerning value for 'A' and 'V'
        }
        return 0;
      });

    const width = manager.getStringWidth(
      "AV",
      "Helvetica",
      12,
      FontStyle.Normal
    );
    // char width: 600 for each + kerning: 0.1 * 12 (font size)
    expect(width).toBe(600 + 600 + 0.1 * 12); // 1200 + 1.2 = 1201.2
  });
});

describe("PDFObjectManager - Images", () => {
  it("should register an image and return the correct object number", () => {
    const manager = new PDFObjectManager();
    const imageObjectNumber = manager.registerImage(
      100,
      200,
      "DCTDecode",
      "imageData"
    );

    expect(imageObjectNumber).toBe(1);
  });

  it("should return all registered images", () => {
    const manager = new PDFObjectManager();
    manager.registerImage(100, 200, "DCTDecode", "imageData");

    const images = manager.getAllImagesRaw();
    expect(images.size).toBe(1);
    expect(images.has("IM1")).toBe(true);
  });
});

describe("PDFObjectManager - XRef and Trailer", () => {
  it("should generate the correct XRef table", () => {
    const manager = new PDFObjectManager();
    manager.addObject("First object");

    const xrefTable = manager.getXRefTable();
    expect(xrefTable).toContain("0000000009 00000 n "); // Die Position des ersten Objekts ist 9
  });

  it("should generate the correct trailer", () => {
    const manager = new PDFObjectManager();
    manager.addObject("First object");

    const trailer = manager.getTrailerAndXRef(9);
    expect(trailer).toContain("/Size 2");
    expect(trailer).toContain("startxref");
    expect(trailer).toContain("9");
  });
});

describe("PDFObjectManager - Images", () => {
  it("should register an image and return the correct object number", () => {
    const manager = new PDFObjectManager();

    const imageWidth = 100;
    const imageHeight = 100;
    const imageType = "DCTDecode";
    const imageData = "some-image-data";

    const imageObjectNumber = manager.registerImage(
      imageWidth,
      imageHeight,
      imageType,
      imageData
    );

    expect(imageObjectNumber).toBe(1);
    const allImages = manager.getAllImagesRaw();
    expect(allImages.has("IM1")).toBe(true);
    expect(allImages.get("IM1")).toBe(imageObjectNumber);
  });
});

describe("PDFObjectManager - Object Replacement", () => {
  it("should replace an object correctly", () => {
    const manager = new PDFObjectManager();
    const objectNumber = manager.addObject("Original Content");

    manager.replaceObject(objectNumber, "Updated Content");

    const renderedObjects = manager.getRenderedObjects();
    expect(renderedObjects).toContain("Updated Content");
    expect(renderedObjects).not.toContain("Original Content");
  });
});

describe("PDFObjectManager - AFM Parsing", () => {
  it("should load an AFM file and correctly parse advance widths and kerning", () => {
    const afmData = fs.readFileSync("./src/lib/assets/Helvetica.afm", "utf-8");
    const parser = new AFMParser(afmData);

    const advanceWidth = parser.getAdvanceWidth("A");
    expect(advanceWidth).toBeGreaterThan(0);

    const kerning = parser.getKerning("A", "V");
    expect(kerning).toBeLessThan(0);
  });
});

describe("PDFObjectManager - Kerning Calculation", () => {
  it("should apply kerning when calculating string width", () => {
    const manager = new PDFObjectManager();
    manager.registerFont("Helvetica", FontStyle.Normal);

    const kerningSpy = vitest
      .spyOn(manager as any, "getKerning")
      .mockReturnValue(0.1);

    const width = manager.getStringWidth(
      "AV",
      "Helvetica",
      12,
      FontStyle.Normal
    );
    expect(kerningSpy).toHaveBeenCalledWith(
      "A",
      "V",
      undefined,
      "Helvetica",
      "normal"
    );
    expect(width).toBeGreaterThan(12); // Kerning adds to width
  });
});

describe("PDFObjectManager - XRef Table and Trailer with multiple objects", () => {
  it("should generate correct XRef table and trailer for multiple objects with calculated byte offsets", () => {
    const manager = new PDFObjectManager();

    // Add objects
    manager.addObject("First Object");
    manager.addObject("Second Object");
    manager.addObject("Third Object");

    // Calculate the byte positions
    const header = "%PDF-1.4\n";
    const firstObject = "1 0 obj\nFirst Object\nendobj\n";
    const secondObject = "2 0 obj\nSecond Object\nendobj\n";

    const firstObjectOffset = header.length; // Start directly after header
    const secondObjectOffset = firstObjectOffset + firstObject.length;
    const thirdObjectOffset = secondObjectOffset + secondObject.length;

    const xrefTable = manager.getXRefTable();

    // Verify that the table starts with 'xref' and lists the correct number of objects
    expect(xrefTable).toContain("xref");
    expect(xrefTable).toContain("0 4"); // One free object + three added objects

    // Check that each object has a reference in the XRef table
    expect(xrefTable).toMatch(/0000000000 65535 f/); // Free object
    expect(xrefTable).toMatch(
      new RegExp(`${String(firstObjectOffset).padStart(10, "0")} 00000 n`)
    ); // First object
    expect(xrefTable).toMatch(
      new RegExp(`${String(secondObjectOffset).padStart(10, "0")} 00000 n`)
    ); // Second object
    expect(xrefTable).toMatch(
      new RegExp(`${String(thirdObjectOffset).padStart(10, "0")} 00000 n`)
    ); // Third object

    const trailer = manager.getTrailerAndXRef(50);

    // Verify that the trailer contains the correct size and root object reference
    expect(trailer).toContain("/Size 4"); // Total objects (1 free + 3 added)
    expect(trailer).toContain("startxref");
    expect(trailer).toContain("50"); // Start of XRef table
  });
});
