import { FontStyle, PDFObjectManager } from "../utils/pdf-object-manager";
import { InjectObjectManager } from "../utils/pdf-object-manager-decorator";
import {
  PDFElement,
  SizedElement,
  SizedPDFElement,
  WithChild,
} from "./pdf-element";

interface ContainerElementParams extends SizedElement, WithChild {}

// @InjectObjectManager()
export class ContainerElement extends SizedPDFElement {
  private child: PDFElement;

  @InjectObjectManager()
  private _objectManager!: PDFObjectManager;

  constructor({ x, y, width, height, child }: ContainerElementParams) {
    super({ x, y, width, height });

    this.child = child;
  }

  override getProps(): ContainerElementParams {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      child: this.child,
    };
  }
}
