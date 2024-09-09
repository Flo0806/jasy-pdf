import { TextElement } from "../elements";
import { PageElement } from "../elements/page-element";
import { TextRenderer } from "./text-renderer";

export class PageRenderer {
  static render(page: PageElement): string {
    // Render all elements on the page (this time only `Text`)
    console.log(page.elements);
    const renderedElements = page.elements
      .map((element) => {
        if (element instanceof TextElement) {
          return TextRenderer.render(element);
        }
        return ""; // Later..... more renderer
      })
      .join("\n");

    return `<< /Type /Page >>\n${renderedElements}`;
  }
}
