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
      // Verwende die FlexLayoutHelper-Klasse, um das Layout zu berechnen
      const { positions, usedHeight, totalFlex } =
        FlexLayoutHelper.calculateFlexLayout(this.children, result, this.y);

      // Setze alle Positionen basierend auf den berechneten Werten
      const remainingHeight = Math.max(result.height || 0 - usedHeight, 0);

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
          // Feste Elemente wurden bereits berechnet, setze einfach die Y-Position
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
