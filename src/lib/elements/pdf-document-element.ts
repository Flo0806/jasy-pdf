import { PageElement } from "./page-element";

export class PDFDocumentElement {
  constructor(public pages: PageElement[]) {}

  render() {
    return this.pages.map((page) => page.render()).join("\n");
  }
}
