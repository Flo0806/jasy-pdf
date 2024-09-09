import { Page } from "../elements/page";
import { TextRenderer } from "./text-renderer";

export class PageRenderer {
  static render(page: Page): string {
    // Render alle Elemente auf der Seite (vorerst nur Text)
    const renderedElements = page.elements
      .map((element) => {
        if (element instanceof Text) {
          return TextRenderer.render(element);
        }
        return ""; // Hier kannst du später weitere Renderer integrieren
      })
      .join("\n");

    return `<< /Type /Page >>\n${renderedElements}`;
  }
}
