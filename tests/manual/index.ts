import { PDFDocument } from "../../src/lib/elements/pdf-document-element";
import { Page } from "../../src/lib/elements/page-element";
import { Text } from "../../src/lib/elements/text-element";
import { PDFRenderer } from "../../src/lib/renderer/pdf-renderer";

const pdf = new PDFDocument([
  new Page([
    new Text({
      x: 100,
      y: 200,
      fontSize: 24,
      color: [255, 0, 0],
      content: "Hello, JasyPDF!",
    }),
    new Text({
      x: 150,
      y: 250,
      fontSize: 18,
      color: [0, 0, 255],
      content: "This is a test.",
    }),
  ]),
]);

const renderedPDF = PDFRenderer.render(pdf);
console.log(renderedPDF);
