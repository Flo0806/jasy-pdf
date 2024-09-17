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
import { ContainerElement } from "../../src/lib/elements/container-element";

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
    return new PDFDocumentElement({
      children: [
        new PageElement({
          children: [
            new ContainerElement({
              x: 50,
              y: 10,
              width: 400,
              height: 300,
              children: [
                new TextElement({
                  x: 50,
                  y: 0,
                  fontSize: 11,
                  color: [0, 0, 255],
                  fontFamily: "Times-Roman",
                  content:
                    "This is a test. YES! It's a ve long text. I wanna see if the pdf will be brea into a new line!",
                }),
              ],
            }),
          ],
        }),
      ],
    });
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
// etst.
const renderedPDF = MyPDF.render(); // PDFRenderer.render(pdf);
console.log(renderedPDF);
fs.writeFile("C:/Users/fh/Downloads/test.pdf", renderedPDF, (err) => {
  if (err) {
    console.error("Error writing file:", err);
  } else {
    console.log("PDF saved successfully!");
  }
});
