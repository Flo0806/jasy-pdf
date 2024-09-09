import { Text } from "./text";

export class Page {
  constructor(public elements: Text[]) {}

  render() {
    return this.elements.map((element) => element.render()).join("\n");
  }
}
