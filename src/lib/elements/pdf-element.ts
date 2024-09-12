export abstract class PDFElement {
  protected abstract getProps(): { [key: string]: any };
}

export interface WithChildren {
  children: PDFElement[];
}

export interface WithChild {
  child: PDFElement;
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

export function isWithChildren(obj: any): obj is WithChildren {
  return "children" in obj;
}

export function isWithChild(obj: any): obj is WithChild {
  return "child" in obj;
}
