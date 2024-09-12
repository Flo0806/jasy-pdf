import { FontStyle, PDFObjectManager } from "../utils/pdf-object-manager";
import { InjectObjectManager } from "../utils/pdf-object-manager-decorator";
import { PDFElement, SizedElement, SizedPDFElement } from "./pdf-element";
export interface TextSegment {
  content: string;
  fontStyle?: FontStyle;
  fontColor?: [number, number, number];
  fontFamily?: string;
}

interface TextElementParams extends SizedElement {
  id?: string;
  output?: any;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize: number;
  fontFamily?: string;
  fontStyle?: FontStyle;
  content: string | TextSegment[];
  color?: [number, number, number]; // optional param
}

// @InjectObjectManager()
export class TextElement extends SizedPDFElement {
  private fontSize: number;
  private fontFamily: string;
  private fontStyle: FontStyle;
  private color: [number, number, number];
  private content: string | TextSegment[];

  @InjectObjectManager()
  private _objectManager!: PDFObjectManager;

  constructor({
    x,
    y,
    fontSize,
    content,
    fontFamily = "Helvetica",
    fontStyle = FontStyle.Normal,
    color = [0, 0, 0],
    width,
    height,
  }: TextElementParams) {
    super({ x, y, width, height });

    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.fontStyle = fontStyle;
    this.color = color;
    this.content = content;
  }

  getProps() {
    return {
      x: this.x,
      y: this.y,
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      fontStyle: this.fontStyle,
      color: this.color,
      content: this.content,
    };
  }

  getSize() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}
