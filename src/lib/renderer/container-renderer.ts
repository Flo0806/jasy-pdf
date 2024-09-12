import { PDFObjectManager } from "../utils/pdf-object-manager";
import { ContainerElement } from "../elements/container-element";
import { TextRenderer } from "./text-renderer"; // Für das Rendern von Textelementen
import { SizedPDFElement } from "../elements/sized-pdf-element"; // Falls ein Element Größe hat
import { TextElement } from "../elements";
import { hasChildren, hasChild } from "../elements/pdf-element";

export class ContainerRenderer {
  static render(
    containerElement: ContainerElement,
    objectManager: PDFObjectManager
  ): string {
    const { x, y, width, height, child } = containerElement.getProps();
    let renderedContent = "";

    // Beginne das Zeichnen eines Rechtecks, das die Größe der Box darstellt
    renderedContent += `${x} ${y} ${width} ${height} re S\n`;

    // Gehe durch jedes Kindelement und rendere es
    elements.forEach((element) => {
      if (element instanceof SizedPDFElement) {
        // Rende jedes Kind mit seinem eigenen Renderer, z.B. TextRenderer
        if (element instanceof TextElement) {
          renderedContent += TextRenderer.render(element, objectManager);
        } else {
          // Hier kannst du andere Renderer für verschiedene Elemente aufrufen
        }
      }
    });

    return renderedContent;
  }

  calculateContainerSizeAndPosition(container: SizedPDFElement) {
    if (hasChildren(container)) {
      let maxWidth = 0;
      let totalHeight = 0;

      container.children.forEach((child) => {
        // If the child has its own children or is a container
        if (hasChildren(child) || hasChild(child)) {
          this.calculateContainerSizeAndPosition(child as SizedPDFElement);
        }

        if (child instanceof SizedPDFElement) {
          let sizedChild = child as SizedPDFElement;
          // Set child's x and y relative to the container
          sizedChild.x += (container as SizedPDFElement).x;
          sizedChild.y += (container as SizedPDFElement).y;

          // Calculate max width and total height for container
          maxWidth = Math.max(maxWidth, sizedChild.x + sizedChild.width);
          totalHeight += sizedChild.height;
        }
      });

      // Set container size based on its children's size
      (container as SizedPDFElement).width = maxWidth;
      (container as SizedPDFElement).height = totalHeight;
    } else if (hasChild(container)) {
      // Single child case
      const child = container.child as SizedPDFElement;
      child.x += (container as SizedPDFElement).x;
      child.y += (container as SizedPDFElement).y;

      this.calculateContainerSizeAndPosition(child);

      (container as SizedPDFElement).width = child.width;
      (container as SizedPDFElement).height = child.height;
    }
  }
}
