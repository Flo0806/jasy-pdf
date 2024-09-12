import { PDFDocumentElement } from "../../src/lib/elements/pdf-document-element";
import { PageElement } from "../../src/lib/elements/page-element";
import { TextElement } from "../../src/lib/elements/text-element";
import { PDFRenderer } from "../../src/lib/renderer/pdf-renderer";
import { PDFDocument } from "../../src/lib/renderer/pdf-document-class";
import fs from "fs";
import {
  FontStyle,
  PDFObjectManager,
} from "../../src/lib/utils/pdf-object-manager";

class MyPDF extends PDFDocument {
  size = {};
  asdf: TextElement = new TextElement({
    x: 100,
    y: 200,
    fontSize: 24,
    color: [255, 0, 0],
    content: this.giveName(),
    id: "1",
  });

  constructor() {
    super();
  }

  build(): PDFDocumentElement {
    console.log("KKKK", this.size);
    return new PDFDocumentElement([
      new PageElement([
        new TextElement({
          x: 150,
          y: 250,
          fontSize: 18,
          color: [0, 0, 255],
          fontFamily: "Courier",
          content:
            this.asdf.testSize() +
            "This is a test. YES! It's a very long text. I wanna see if the pdf will be break into a new line!",
        }),
      ]).addTextElement(this.asdf),
    ]);
  }
}

// let etst = new TextElement({
//   x: 50,
//   y: 100,
//   fontSize: 24,
//   color: [255, 0, 0],
//   content: [
//     {
//       content: "Ein erster ",
//       fontStyle: FontStyle.Normal,
//       fontColor: [200, 0, 100],
//     },
//     {
//       content: "Ein zweiter!",
//       fontStyle: FontStyle.Normal,
//       fontColor: [0, 255, 100],
//     },
//   ],
// });

const renderedPDF = MyPDF.render(); // PDFRenderer.render(pdf);
console.log(renderedPDF);
fs.writeFile("C:/Users/fh/Downloads/test.pdf", renderedPDF, (err) => {
  if (err) {
    console.error("Error writing file:", err);
  } else {
    console.log("PDF saved successfully!");
  }
});
