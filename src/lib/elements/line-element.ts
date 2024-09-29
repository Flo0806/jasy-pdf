import { PDFObjectManager } from "../utils/pdf-object-manager";
import { InjectObjectManager } from "../utils/pdf-object-manager-decorator";
import {
  LayoutConstraints,
  SizedElement,
  SizedPDFElement,
} from "./pdf-element";

interface LineElementParams extends SizedElement {
  color?: [number, number, number];
  strokeWidth?: number;
  x: number;
  y: number;
  xEnd: number;
  yEnd: number;
}

export class LineElement extends SizedPDFElement {
  private color?: [number, number, number];
  private strokeWidth?: number;
  private xEnd: number;
  private yEnd: number;

  private sizeMemory!: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };

  @InjectObjectManager()
  private _objectManager!: PDFObjectManager;

  constructor({
    color = [0, 0, 0],
    strokeWidth,
    x,
    y,
    xEnd,
    yEnd,
  }: LineElementParams) {
    super({ x: x, y: y, width: xEnd, height: yEnd });

    this.color = color;
    this.strokeWidth = strokeWidth ? strokeWidth : 1;
    this.x = x;
    this.y = y;
    this.xEnd = xEnd;
    this.yEnd = yEnd;
    this.sizeMemory = { x, y, width: xEnd, height: yEnd };
  }

  calculateLayout(parentConstraints?: LayoutConstraints): LayoutConstraints {
    if (parentConstraints) {
      // Set relative to parent
      this.x = this.sizeMemory?.x + parentConstraints.x;
      this.y = this.sizeMemory.y + parentConstraints.y;

      // Now calc the end position relative to parent:
      if (!parentConstraints.width) {
        throw new Error(
          "The LineElement must be placed inside a parent container that defines its width"
        );
      }

      this.xEnd =
        parentConstraints.x + parentConstraints.width - this.sizeMemory.width!;
      this.yEnd = parentConstraints.y + this.sizeMemory.height!;
    }

    // Line element is special. Here we have xEnd/yEnd and width/height property!
    const result = {
      x: this.x,
      y: this.y,
      xEnd: this.xEnd,
      yEnd: this.yEnd,
      width: this.width,
      height: this.height,
    };

    this.normalizeCoordinates();
    return result;
  }

  normalizeCoordinates() {
    const pageHeight = this._objectManager.pageFormat[1];
    this.y = pageHeight - this.y - (this.height || 0);
    this.height = Math.abs(this.sizeMemory.height! - this.sizeMemory.y);
    this.width = Math.abs(this.sizeMemory.width! - this.sizeMemory.x);
  }

  override getProps() {
    return {
      x: this.x,
      y: this.y,
      xEnd: this.xEnd,
      yEnd: this.yEnd,
      height: this.height,
      width: this.width,
      color: this.color,
      strokeWidth: this.strokeWidth,
    };
  }
}
