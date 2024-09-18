import { TextRenderer } from "../renderer";
import { FontStyle, PDFObjectManager } from "../utils/pdf-object-manager";
import { InjectObjectManager } from "../utils/pdf-object-manager-decorator";
import {
  LayoutConstraints,
  PDFElement,
  SizedElement,
  SizedPDFElement,
} from "./pdf-element";
export interface TextSegment {
  content: string;
  fontStyle?: FontStyle;
  fontColor?: [number, number, number];
  fontFamily?: string;
}

interface TextElementParams {
  id?: string;
  output?: any;
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
    fontSize,
    content,
    fontFamily = "Helvetica",
    fontStyle = FontStyle.Normal,
    color = [0, 0, 0],
  }: TextElementParams) {
    super({ x: 0, y: 0 });

    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.fontStyle = fontStyle;
    this.color = color;
    this.content = content;
  }

  calculateLayout(parentConstraints?: LayoutConstraints): LayoutConstraints {
    if (parentConstraints) {
      this.x = parentConstraints.x;
      this.y = parentConstraints.y;
      if (parentConstraints.width) {
        this.width = parentConstraints.width - this.x + parentConstraints.x;
      }
      const textHeight = TextRenderer.calculateTextHeight(
        this.content,
        this.fontSize,
        this.fontFamily,
        this._objectManager,
        this.width || 0
      );
      this.height = textHeight;
      // if (parentConstraints.height)
      //   this.height = parentConstraints.height - this.y;
    }

    this.normalizeCoordinates();

    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  normalizeCoordinates() {
    const pageHeight = this._objectManager.pageFormat[1];
    this.y = pageHeight - this.y - (this.fontSize || 0);
  }

  override getSize(): SizedElement {
    const textHeight = TextRenderer.calculateTextHeight(
      this.content,
      this.fontSize,
      this.fontFamily,
      this._objectManager,
      this.width || 0
    );

    return { x: this.x, y: this.y, width: this.width, height: textHeight };
  }

  override getProps() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      fontStyle: this.fontStyle,
      color: this.color,
      content: this.content,
    };
  }
}
