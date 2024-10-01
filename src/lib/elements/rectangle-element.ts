import { Color } from "../common/color";
import { pageFormats } from "../constants/page-sizes";
import { Orientation } from "../renderer";
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
  color?: Color;
  backgroundColor?: Color;
  borderWidth?: number;
}

export class RectangleElement extends SizedPDFElement {
  private children: PDFElement[] = [];
  private color: Color;
  private backgroundColor?: Color;
  private borderWidth: number;

  private sizeMemory!: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };

  @InjectObjectManager()
  private _objectManager!: PDFObjectManager;

  constructor({
    children = [],
    color = new Color(0, 0, 0),
    backgroundColor,
    borderWidth,
    width,
    height,
  }: RectangleElementParams) {
    super({ x: 0, y: 0, width, height });

    this.children = children;
    this.color = color;
    this.backgroundColor = backgroundColor;
    this.borderWidth = borderWidth ? borderWidth : 1;
    this.sizeMemory = { x: 0, y: 0, width, height };
  }

  calculateLayout(parentConstraints?: LayoutConstraints): LayoutConstraints {
    if (parentConstraints) {
      if (parentConstraints.width) {
        this.width = parentConstraints.width;
      }
      if (parentConstraints.height) {
        this.height = parentConstraints.height;
      }
      this.x = this.sizeMemory.x + parentConstraints.x;
      this.y = this.sizeMemory.y + parentConstraints.y;
    }

    const result = {
      x: this.x,
      y: this.y,
      width: (this.width || 0) + this.borderWidth,
      height: (this.height || 0) + this.borderWidth, // The rectangle goes bigger with its border width
    };

    this.normalizeCoordinates();
    return result;
  }

  normalizeCoordinates() {
    const pageConfig = this._objectManager.getCurrentPageConfig();
    const pageHeight =
      pageFormats[pageConfig.pageSize!][
        pageConfig.orientation === Orientation.landscape ? 0 : 1
      ];
    this.y = pageHeight - this.y - (this.height || 0);
  }

  override getProps() {
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
