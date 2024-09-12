import { PDFObjectManager } from "./pdf-object-manager";

// This helps me a lot: https://blog.jannikwempe.com/typescript-class-decorators-incl-dependency-injection-example
export function InjectObjectManager() {
  return function InjectObjectManager<T extends { new (...args: any[]): {} }>(
    constructor: T
  ): T | void {
    // Replacing the original constructor with a new one that provides the injections from the Container
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        (this as any)._objectManager = new PDFObjectManager();
      }
    };
  };
}
