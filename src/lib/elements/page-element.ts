import { TextElement } from "./text-element";

export class PageElement {
  constructor(public elements: TextElement[]) {}

  addTextElement(element: TextElement) {
    this.elements.push(element);
    return this;
  }
}
