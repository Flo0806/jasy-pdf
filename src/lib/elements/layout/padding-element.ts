import { PDFObjectManager } from "../../utils/pdf-object-manager";
import { InjectObjectManager } from "../../utils/pdf-object-manager-decorator";
import { Validator } from "../../validators/element-validator";
import {
  PDFElement,
  LayoutConstraints,
  WithChild,
  SizedElement,
  SizedPDFElement,
} from "../pdf-element";

interface PaddingElementParams extends SizedElement, WithChild {
  margin: [number, number, number, number];
}

export class PaddingElement extends SizedPDFElement {
  private child: PDFElement;
  private margin: [number, number, number, number];

  @InjectObjectManager()
  private _objectManager!: PDFObjectManager;

  constructor({
    margin,
    child,
  }: {
    margin: [number, number, number, number];
    child: PDFElement;
  }) {
    super({ x: 0, y: 0 });

    this.child = child;
    this.margin = margin;
  }

  calculateLayout(parentConstraints?: LayoutConstraints): LayoutConstraints {
    let result = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
    if (parentConstraints) {
      if (parentConstraints.width) this.width = parentConstraints.width || 0;
      //if (parentConstraints.height) this.height = parentConstraints.height || 0;
      this.x = parentConstraints.x;
      this.y = parentConstraints.y;

      result = this.adjustDimensionsForPadding(
        this.x,
        this.y,
        this.width!,
        this.height!,
        this.margin
      );
    }

    const childResult = this.child.calculateLayout(result);
    const [marginTop, marginRight, marginBottom, marginLeft] = this.margin;
    this.height = (childResult.height || 0) + marginTop + marginLeft;
    console.log(this.height);
    result.height = this.height;

    Validator.validateSizedElement(this);

    console.log(result, childResult);

    this.normalizeCoordinates();
    return result;
  }

  adjustDimensionsForPadding(
    x: number,
    y: number,
    width: number,
    height: number,
    margin: [number, number, number, number]
  ): { x: number; y: number; width: number; height: number } {
    const [marginTop, marginRight, marginBottom, marginLeft] = margin;

    // Calculate the new position and size of the child element
    const adjustedX = x + marginLeft; // Move x +marginLeft to right
    const adjustedY = y + marginTop; // Move y +marginTop down - normaly we start in the left-bottom corner. But we transform it to regular left-top corner
    const adjustedWidth = width - marginLeft - marginRight; // Die Breite wird verringert um left + right margin
    const adjustedHeight = height - marginTop - marginBottom; // Die Höhe wird verringert um top + bottom margin

    return {
      x: adjustedX,
      y: adjustedY,
      width: adjustedWidth,
      height: adjustedHeight,
    };
  }

  normalizeCoordinates() {
    const pageHeight = this._objectManager.pageFormat[1];
    this.y = pageHeight - this.y - (this.height || 0);
  }

  override getProps() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      margin: this.margin,
      child: this.child,
    };
  }
}
