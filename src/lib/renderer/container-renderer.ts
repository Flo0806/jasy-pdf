import { PDFObjectManager } from "../utils/pdf-object-manager";
import { ContainerElement } from "../elements/container-element";
import { TextRenderer } from "./text-renderer"; // Für das Rendern von Textelementen
import { TextElement } from "../elements";
import {
  hasChildProp,
  hasChildrenProp,
  PDFElement,
  SizedPDFElement,
} from "../elements/pdf-element";

export class ContainerRenderer {
  static render(
    containerElement: ContainerElement,
    objectManager: PDFObjectManager
  ): string {
    const { x, y, width, height, children } = containerElement.getProps();
    let renderedContent = "";

    // Beginne das Zeichnen eines Rechtecks, das die Größe der Box darstellt
    renderedContent += `${x} ${y} ${width} ${height} re S\n`;
    children.forEach((child) => {
      // Pick the content of all elements of the page

      if (child instanceof TextElement) {
        renderedContent += TextRenderer.render(child, objectManager) + "\n";
      } else if (child instanceof ContainerElement) {
        renderedContent +=
          ContainerRenderer.render(child, objectManager) + "\n";
      }
    });

    return renderedContent;
  }
}
