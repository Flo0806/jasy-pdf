type TextElementParams = {
  x: number;
  y: number;
  fontSize: number;
  content: string;
  color?: [number, number, number]; // optional param
};

export class TextElement {
  private x: number;
  private y: number;
  private fontSize: number;
  private color: [number, number, number];
  private content: string;

  constructor({
    x,
    y,
    fontSize,
    content,
    color = [0, 0, 0],
  }: TextElementParams) {
    this.x = x;
    this.y = y;
    this.fontSize = fontSize;
    this.color = color;
    this.content = content;
  }

  getProps() {
    return {
      x: this.x,
      y: this.y,
      fontSize: this.fontSize,
      color: this.color,
      content: this.content,
    };
  }

  render() {
    return `BT /F1 ${this.fontSize} Tf ${this.color.join(" ")} rg ${this.x} ${
      this.y
    } Td (${this.content}) Tj ET`;
  }
}
