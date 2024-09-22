import { PDFObjectManager } from "../../utils/pdf-object-manager";
import { InjectObjectManager } from "../../utils/pdf-object-manager-decorator";
import {
  SizedElement,
  WithChildren,
  SizedPDFElement,
  PDFElement,
  LayoutConstraints,
} from "../pdf-element";

interface ContainerElementParams extends SizedElement, WithChildren {
  color?: [number, number, number];
  backgroundColor?: [number, number, number];
  borderWidth?: number;
}

// @InjectObjectManager()
export class SizedContainerElement extends SizedPDFElement {
  private children?: PDFElement[];

  @InjectObjectManager()
  private _objectManager!: PDFObjectManager;

  constructor({ width, height, children }: ContainerElementParams) {
    super({ x: 0, y: 0, width, height });

    this.children = children;
  }

  calculateLayout(parentConstraints?: LayoutConstraints): LayoutConstraints {
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
