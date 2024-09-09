import { TextElement } from "../elements/text-element";

export class TextRenderer {
  static render(textElement: TextElement): string {
    const { x, y, fontSize, color, content } = textElement.getProps();
    const colorString = color.map((c) => (c / 255).toFixed(3)).join(" ");
    return `BT /F1 ${fontSize} Tf ${colorString} rg ${x} ${y} Td (${content}) Tj ET`;
  }
}
