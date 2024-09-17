import { FontStyle, PDFObjectManager } from "../utils/pdf-object-manager";
import { InjectObjectManager } from "../utils/pdf-object-manager-decorator";
import {
  LayoutConstraints,
  PDFElement,
  SizedElement,
  SizedPDFElement,
  WithChildren,
} from "./pdf-element";

interface ContainerElementParams extends SizedElement, WithChildren {
  color?: [number, number, number];
  backgroundColor?: [number, number, number];
  borderWidth?: number;
}

// @InjectObjectManager()
export class ContainerElement extends SizedPDFElement {
  private children?: PDFElement[];

  @InjectObjectManager()
  private _objectManager!: PDFObjectManager;

  constructor({ x, y, width, height, children }: ContainerElementParams) {
    super({ x, y, width, height });

    this.children = children;
  }

  calculateLayout(
    parentConstraints?: LayoutConstraints
  ): LayoutConstraints | Promise<LayoutConstraints> {
    if (parentConstraints) {
      if (parentConstraints.width) this.width = parentConstraints.width;
      if (parentConstraints.height) this.height = parentConstraints.height;
      this.x += parentConstraints.x;
      this.y += parentConstraints.y;
    }

    const result = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };

    if (this.children)
      this.children.forEach((child) => child.calculateLayout(result));

    this.normalizeCoordinates();
    return result;
  }

  normalizeCoordinates() {
    const pageHeight = this._objectManager.pageFormat[1];
    this.y = pageHeight - this.y - (this.height || 0);
  }

  override getProps(): ContainerElementParams {
    return {
      x: this.x,
      y: this.y,
      width: this.width!,
      height: this.height,
      children: this.children,
    };
  }
}
