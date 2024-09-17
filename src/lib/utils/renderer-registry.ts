export class RendererRegistry {
  private static renderers = new Map<Function, Function>();

  static register(elementClass: Function, renderer: Function) {
    if (!RendererRegistry.renderers.has(elementClass)) {
      RendererRegistry.renderers.set(elementClass, renderer);
    }
  }
  static getRenderer(element: any): Function | undefined {
    return RendererRegistry.renderers.get(element.constructor);
  }
}
