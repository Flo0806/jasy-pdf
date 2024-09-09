import { TextRenderer } from "../renderer/text-renderer";

export interface TextSegment {
  content: string;
  fontStyle?: "normal" | "bold" | "italic";
  fontColor?: [number, number, number];
  fontFamily?: string;
}

type TextElementParams = {
  x: number;
  y: number;
  fontSize: number;
  fontFamily?: string;
  content: string | TextSegment[];
  color?: [number, number, number]; // optional param
};

export class TextElement {
  private x: number;
  private y: number;
  private fontSize: number;
  private fontFamily: string;
  private color: [number, number, number];
  private content: string | TextSegment[];
  private width: number;
  private height: number;

  constructor({
    x,
    y,
    fontSize,
    content,
    fontFamily = "Helvetica",
    color = [0, 0, 0],
  }: TextElementParams) {
    this.x = x;
    this.y = y;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.color = color;
    this.content = content; // <-- Hier arbeiten wir dran!

    const { width, height } = TextRenderer.getTextSize(this);
    this.width = width;
    this.height = height;
  }

  getProps() {
    return {
      x: this.x,
      y: this.y,
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      color: this.color,
      content: this.content,
    };
  }

  getSize() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}
