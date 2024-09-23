import { PDFObjectManager } from "../utils/pdf-object-manager";
import { ContainerElement } from "../elements/container-element";
import { RendererRegistry } from "../utils/renderer-registry";

export class ContainerRenderer {
  static async render(
    containerElement: ContainerElement,
    objectManager: PDFObjectManager
  ): Promise<string> {
    const { children } = containerElement.getProps();
    let renderedContent = "";

    if (children)
      for (let child of children) {
        // Pick the content of all elements of the page
        const renderer = RendererRegistry.getRenderer(child);
        if (renderer) {
          renderedContent += await renderer(child, objectManager);
        }
      }

    return renderedContent;
  }
}
