export abstract class PDFElement {
  abstract getProps(): { [key: string]: any };

  abstract calculateLayout(
    parentConstraints?: LayoutConstraints
  ): LayoutConstraints;
}

export abstract class SizedPDFElement extends PDFElement {
  protected x: number;
  protected y: number;
  protected width?: number;
  protected height?: number;

  constructor(data: SizedElement) {
    super();
    this.x = data.x;
    this.y = data.y;
    this.width = data.width;
    this.height = data.height;
  }

  public getSize(): SizedElement {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}

export abstract class FlexiblePDFElement extends PDFElement {
  protected flex: number;
  protected verticalChildAlignment: VerticalAlignment;

  constructor(data: FlexibleElement) {
    super();
    this.flex = data.flex;
    this.verticalChildAlignment =
      data.verticalChildAlignment || VerticalAlignment.middle;
  }

  getFlex(): number {
    return this.flex;
  }
}

export enum HorizontalAlignment {
  left = "LEFT",
  right = "RIGHT",
  center = "CENTER",
  block = "BLOCK",
}

export enum VerticalAlignment {
  top = "TOP",
  middle = "MIDDLE",
  bottom = "BOTTOM",
}

export interface LayoutConstraints {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface WithChildren {
  children: PDFElement[];
}

export interface WithChild {
  child: PDFElement;
}

export interface FlexibleElement {
  flex: number;
  verticalChildAlignment?: VerticalAlignment;
}

export interface SizedElement {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export function isSizedElement(obj: any): obj is SizedElement {
  return "x" in obj && "y" in obj;
}

export function hasChildrenProp<T extends object>(
  obj: T
): obj is T & WithChildren {
  return "children" in obj;
}

export function hasChildProp<T extends object>(obj: T): obj is T & WithChild {
  return "child" in obj;
}
