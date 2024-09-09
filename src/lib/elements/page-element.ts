import { TextElement } from "./text-element";

export class PageElement {
  constructor(public elements: TextElement[]) {}

  render() {
    return this.elements.map((element) => element.render()).join("\n");
  }
}
