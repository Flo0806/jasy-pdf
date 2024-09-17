import { LayoutConstraints, PDFElement, WithChildren } from "./pdf-element";
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

  calculateLayout(parentConstraints: LayoutConstraints): LayoutConstraints {
    const result = { x: 0, y: 0 };
    // Inside a page we must do nothing
    this.children.forEach((child) => child.calculateLayout(result));
    return result;
  }

  override getProps(): PDFPageParams {
    return { children: this.children };
  }

  addTextElement(element: TextElement) {
    this.children.push(element);
    return this;
  }
}
