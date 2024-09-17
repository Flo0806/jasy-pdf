import { PDFDocumentElement } from "../../src/lib/elements/pdf-document-element";
import { PageElement } from "../../src/lib/elements/page-element";
import { TextElement } from "../../src/lib/elements/text-element";
import { PDFRenderer } from "../../src/lib/renderer/pdf-renderer";
import { RectangleElement } from "../../src/lib/elements/rectangle-element";
import { PDFDocument } from "../../src/lib/renderer/pdf-document-class";
import fs from "fs";
import {
  FontStyle,
  PDFObjectManager,
} from "../../src/lib/utils/pdf-object-manager";
import { ContainerElement } from "../../src/lib/elements/container-element";
import { FlexiblePDFElement } from "../../src/lib/elements/pdf-element";
import { ExpandedElement } from "../../src/lib/elements";

class MyPDF extends PDFDocument {
  size = {};
  asdf: TextElement = new TextElement({
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
              color: [255, 0, 0],
              backgroundColor: [100, 255, 50],
              children: [
                // new RectangleElement({
                //   color: [0, 0, 255],
                //   backgroundColor: [255, 0, 50],
                // }),
                new TextElement({
                  fontSize: 11,
                  color: [0, 0, 255],
                  fontFamily: "Times-Roman",
                  content: "This is Text 1",
                }),
                new ExpandedElement({
                  flex: 2,
                  child: new TextElement({
                    fontSize: 11,
                    color: [0, 0, 255],
                    fontFamily: "Times-Roman",
                    content: "This is a Text 2",
                  }),
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
