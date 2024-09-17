import { PDFObjectManager } from "../utils/pdf-object-manager";
import { PageElement } from "./page-element";
import { LayoutConstraints, PDFElement, WithChildren } from "./pdf-element";

interface PDFDocumentParams extends WithChildren {
  children: PageElement[];
}
export class PDFDocumentElement extends PDFElement {
  private children: PageElement[];

  constructor({ children }: PDFDocumentParams) {
    super();
    const preInitializedManager = new PDFObjectManager();
    Reflect.defineMetadata("PDFObjectManager", preInitializedManager, this);
    this.children = children;
  }

  calculateLayout(parentConstraints?: LayoutConstraints): LayoutConstraints {
    const result = { x: 0, y: 0 };
    this.children.forEach((child) => child.calculateLayout(result));
    return result;
  }

  override getProps(): PDFDocumentParams {
    return { children: this.children };
  }
}
