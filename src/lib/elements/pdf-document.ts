import { Page } from "./page";

export class PDFDocument {
  constructor(public pages: Page[]) {}

  render() {
    return this.pages.map((page) => page.render()).join("\n");
  }
}
