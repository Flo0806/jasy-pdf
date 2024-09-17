import { PDFObjectManager } from "../utils/pdf-object-manager";
import { InjectObjectManager } from "../utils/pdf-object-manager-decorator";
import {
  LayoutConstraints,
  PDFElement,
  SizedElement,
  SizedPDFElement,
  WithChildren,
} from "./pdf-element";

interface RectangleElementParams extends SizedElement, WithChildren {
  color?: [number, number, number];
  backgroundColor?: [number, number, number];
  borderWidth?: number;
}

export class RectangleElement extends SizedPDFElement {
  private children: PDFElement[] = [];
  private color;
  private backgroundColor?: [number, number, number];
  private borderWidth: number;

  @InjectObjectManager()
  private _objectManager!: PDFObjectManager;

  constructor({
    x,
    y,
    width,
    height,
    children = [],
    color = [0, 0, 0],
    backgroundColor,
    borderWidth,
  }: RectangleElementParams) {
    super({ x, y, width, height });

    this.children = children;
    this.color = color;
    this.backgroundColor = backgroundColor;
    this.borderWidth = borderWidth ? borderWidth : 1;
  }

  calculateLayout(
    parentConstraints?: LayoutConstraints
  ): LayoutConstraints | Promise<LayoutConstraints> {
    if (parentConstraints) {
      if (parentConstraints.width) {
        const calculatedWidth = parentConstraints.width - this.x;
        this.width =
          calculatedWidth < (this.width || 0) ? calculatedWidth : this.width;
      }
      if (parentConstraints.height) {
        const calculatedHeight = parentConstraints.height - this.x;
        this.width =
          calculatedHeight < (this.height || 0) ? calculatedHeight : this.width;
      }
      this.x += parentConstraints.x;
      this.y += parentConstraints.y;
    }

    const result = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };

    this.normalizeCoordinates();
    return result;
  }

  normalizeCoordinates() {
    const pageHeight = this._objectManager.pageFormat[1];
    this.y = pageHeight - this.y - (this.height || 0);
  }

  override getProps(): RectangleElementParams {
    return {
      x: this.x,
      y: this.y,
      width: this.width!,
      height: this.height,
      children: this.children,
      color: this.color,
      backgroundColor: this.backgroundColor,
      borderWidth: this.borderWidth,
    };
  }
}
