import { PDFDocumentElement } from "../../src/lib/elements/pdf-document-element";
import { PageElement } from "../../src/lib/elements/page-element";
import { TextElement } from "../../src/lib/elements/text-element";
import { PDFRenderer } from "../../src/lib/renderer/pdf-renderer";

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
      content: "This is a test. YES!",
    }),
  ]),
]);

const renderedPDF = PDFRenderer.render(pdf);
console.log(renderedPDF);
