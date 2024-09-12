import { PDFObjectManager } from "./pdf-object-manager";
interface Injection {
  index: number;
  key: string;
}
export function InjectObjectManager() {
  return function (target: any, propertyKey: string) {
    const privateKey = `__${propertyKey}`;

    Object.defineProperty(target, propertyKey, {
      get() {
        return this[privateKey];
      },
      set(value: any) {
        this[privateKey] = value;
      },
      enumerable: true,
      configurable: true,
    });
  };
}

// This helps me a lot: https://blog.jannikwempe.com/typescript-class-decorators-incl-dependency-injection-example
export function injectionTarget() {
  return function injectionTarget<T extends { new (...args: any[]): {} }>(
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
