import { FlexLayoutHelper } from "../utils/flex-layout";
import { FontStyle, PDFObjectManager } from "../utils/pdf-object-manager";
import { InjectObjectManager } from "../utils/pdf-object-manager-decorator";
import {
  FlexiblePDFElement,
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

    if (this.children) {
      // Helper to caluclate the height
      const { positions, usedHeight, totalFlex } =
        FlexLayoutHelper.calculateFlexLayout(this.children, result, this.y);
      // Calc the remaining height and set the current positions
      const remainingHeight = Math.max((result.height || 0) - usedHeight, 0);

      for (let position of positions) {
        const { element, y } = position;
        if (element instanceof FlexiblePDFElement) {
          const flexHeight = (element.getFlex() / totalFlex) * remainingHeight;
          element.calculateLayout({
            ...result,
            y: y,
            height: flexHeight,
          });
        } else {
          // Fixed elements are already calculated. Set only the y position
          element.calculateLayout({
            ...result,
            y: y,
          });
        }
      }
    }

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
