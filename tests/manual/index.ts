import { PDFDocumentElement } from "../../src/lib/elements/pdf-document-element";
import { PageElement } from "../../src/lib/elements/page-element";
import { TextElement } from "../../src/lib/elements/text-element";
import { PDFDocument } from "../../src/lib/renderer/pdf-document-class";
import fs from "fs";
import { ContainerElement } from "../../src/lib/elements/container-element";
import {
  BoxFit,
  CustomLocalImage,
  ExpandedElement,
  ImageElement,
  LineElement,
  PaddingElement,
} from "../../src/lib/elements";
import { getArrayBuffer } from "../../src/lib/utils/utf8-to-windows1252-encoder";
import { HorizontalAlignment } from "../../src/lib/elements/pdf-element";
import { FontStyle } from "../../src/lib/utils/pdf-object-manager";
import { TextRenderer } from "../../src/lib/renderer";

class MyPDF extends PDFDocument {
  async TestFunc(): Promise<void> {}
  constructor() {
    super();
    this.test();
  }

  async test() {
    const test = TextRenderer.render.constructor;
  }

  build(): PDFDocumentElement {
    return new PDFDocumentElement({
      children: [
        new PageElement({
          children: [
            new ContainerElement({
              x: 50,
              y: 0,
              width: 400,
              height: 500,
              color: [255, 0, 0],
              backgroundColor: [100, 255, 50],
              children: [
                // new RectangleElement({
                //   color: [0, 0, 255],
                //   backgroundColor: [255, 0, 50],
                // }),
                new LineElement({
                  x: 10,
                  y: 10,
                  xEnd: 10,
                  yEnd: 20,
                  strokeWidth: 1,
                }),
                new PaddingElement({
                  margin: [10, 10, 10, 10],
                  child: new TextElement({
                    fontSize: 11,
                    color: [0, 0, 255],
                    fontFamily: "Helvetica",
                    textAlignment: HorizontalAlignment.center,
                    //fontStyle: FontStyle.Bold,
                    content: [
                      {
                        fontStyle: FontStyle.Italic,
                        content: "Test 1 in Munchen ",
                        fontSize: 16,
                        fontColor: [255, 0, 0],
                      },
                      {
                        fontStyle: FontStyle.Bold,
                        fontFamily: "Times-Roman",
                        content:
                          "Test 2 im Segment mit zu langem Te zum testen ob alles d umbricht und wie es danach aussieht! ",
                      },
                      // {
                      //   content: "Test 13im Segment ",
                      //   fontSize: 16,
                      //   fontColor: [0, 255, 0],
                      // },
                    ],
                  }),
                }),
                new ExpandedElement({
                  flex: 1,
                  child: new ImageElement({
                    fit: BoxFit.fill,
                    image: new CustomLocalImage(
                      "C:\\Users\\fh\\Downloads\\face.jpg"
                    ),
                  }),
                }),
                new ExpandedElement({
                  flex: 1,
                  child: new TextElement({
                    fontSize: 11,
                    color: [0, 0, 255],
                    //fontFamily: "Times-Roman",
                    content: "This is a Text ö",
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

async function runCode() {
  const startDate = new Date();
  const renderedPDF = await MyPDF.render(); // PDFRenderer.render(pdf);
  const endDate = new Date();
  console.log("Done in", endDate.getTime() - startDate.getTime());
  console.log(renderedPDF);

  const buffer = Buffer.from(getArrayBuffer(renderedPDF));
  // fs.writeFileSync("c:/Users/fh/Downloads/test2.pdf", renderedPDF);
  fs.writeFile("C:/Users/fh/Downloads/test.pdf", buffer, (err) => {
    if (err) {
      console.error("Error writing file:", err);
    } else {
      console.log("PDF saved successfully!");
    }
  });
}

runCode();
