import { PageElement } from "./page-element";
import { PDFElement, WithChildren } from "./pdf-element";

interface PDFDocumentParams extends WithChildren {
  children: PageElement[];
}
export class PDFDocumentElement extends PDFElement {
  private children: PageElement[];

  constructor({ children }: PDFDocumentParams) {
    super();
    this.children = children;
  }

  override getProps(): PDFDocumentParams {
    return { children: this.children };
  }
}
