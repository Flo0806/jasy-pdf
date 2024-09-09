import { PDFDocumentElement } from "../../src/lib/elements/pdf-document-element";
import { PageElement } from "../../src/lib/elements/page-element";
import { TextElement } from "../../src/lib/elements/text-element";
import { PDFRenderer } from "../../src/lib/renderer/pdf-renderer";
import fs from "fs";

const pdf = new PDFDocumentElement([
  new PageElement([
    new TextElement({
      x: 100,
      y: 200,
      fontSize: 24,
      color: [255, 0, 0],
      content: "Hello, JasyPDF!",
    }),
    new TextElement({
      x: 150,
      y: 250,
      fontSize: 18,
      color: [0, 0, 255],
      fontFamily: "Courier",
      content:
        "This is a test. YES! It's a very long text. I wanna see if the pdf will be break into a new line!",
    }),
  ]),
]);

const renderedPDF = PDFRenderer.render(pdf);
console.log(renderedPDF);
fs.writeFile("C:/Users/fh/Downloads/test.pdf", renderedPDF, (err) => {
  if (err) {
    console.error("Error writing file:", err);
  } else {
    console.log("PDF saved successfully!");
  }
});
