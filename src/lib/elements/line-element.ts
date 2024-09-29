import { PDFObjectManager } from "../utils/pdf-object-manager";
import { InjectObjectManager } from "../utils/pdf-object-manager-decorator";
import {
  LayoutConstraints,
  PDFElement,
  SizedElement,
  SizedPDFElement,
  WithChildren,
} from "./pdf-element";

interface LineElementParams extends SizedElement {
  color?: [number, number, number];
  strokeWidth?: number;
  start: { x: number; y: number };
  end: { xEnd: number; yEnd: number };
}

export class LineElement extends SizedPDFElement {
  private color: [number, number, number];
  private strokeWidth: number;
  private start: { x: number; y: number };
  private end: { xEnd: number; yEnd: number };

  @InjectObjectManager()
  private _objectManager!: PDFObjectManager;

  constructor({
    color = [0, 0, 0],
    strokeWidth,
    start,
    end,
  }: LineElementParams) {
    super({ x: start.x, y: start.y, width: end.xEnd, height: end.yEnd });

    this.color = color;
    this.strokeWidth = strokeWidth ? strokeWidth : 1;
    this.start = start;
    this.end = end;
  }

  calculateLayout(parentConstraints?: LayoutConstraints): LayoutConstraints {
    if (parentConstraints) {
      // Set relative to parent
      this.x += parentConstraints.x;
      this.y += parentConstraints.y;

      // Now calc the end position relative to parent:
      if (!parentConstraints.width) {
        throw new Error(
          "The LineElement must be placed inside a parent container that defines its width"
        );
      }
      // Standard setting - we using the `SizedPDFElement` and we have a width and height.
      // In our case (with the `LineElement`) we use width as endX, and height as endY point. Otherwise we must create a
      // new interface for this

      this.width = parentConstraints.width - this.end.xEnd - this.start.x;
      this.height = parentConstraints.y + this.end.yEnd;
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

  override getProps() {
    return {
      x: this.x,
      y: this.y,
      xEnd: this.width!,
      yEnd: this.height,
      color: this.color,
      strokeWidth: this.strokeWidth,
    };
  }
}
