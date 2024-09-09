export class Text {
  constructor(
    public x: number,
    public y: number,
    public fontSize: number,
    public color: [number, number, number],
    public content: string
  ) {}

  render() {
    return `BT /F1 ${this.fontSize} Tf ${this.color.join(" ")} rg ${this.x} ${
      this.y
    } Td (${this.content}) Tj ET`;
  }
}
