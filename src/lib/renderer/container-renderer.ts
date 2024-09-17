import { PDFObjectManager } from "../utils/pdf-object-manager";
import { ContainerElement } from "../elements/container-element";
import { RendererRegistry } from "../utils/renderer-registry";

export class ContainerRenderer {
  static render(
    containerElement: ContainerElement,
    objectManager: PDFObjectManager
  ): string {
    const { children } = containerElement.getProps();
    let renderedContent = "";

    if (children)
      children.forEach((child) => {
        // Pick the content of all elements of the page
        const renderer = RendererRegistry.getRenderer(child);
        if (renderer) {
          renderedContent += renderer(child, objectManager) + "\n";
        }
      });

    return renderedContent;
  }
}
