import { PDFElement, WithChildren } from "./pdf-element";
import { TextElement } from "./text-element";

interface PDFPageParams extends WithChildren {
  children: PDFElement[];
}
export class PageElement extends PDFElement {
  private children: PDFElement[];

  constructor({ children }: PDFPageParams) {
    super();
    this.children = children;
  }

  override getProps(): PDFPageParams {
    return { children: this.children };
  }

  addTextElement(element: TextElement) {
    this.children.push(element);
    return this;
  }
}
