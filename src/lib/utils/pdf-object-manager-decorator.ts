import "reflect-metadata";
import { PDFObjectManager } from "./pdf-object-manager";

const OBJECT_MANAGER_KEY = Symbol("PDFObjectManager");

// Dekorator zur Injektion des ObjectManagers
export function InjectObjectManager() {
  return function (target: any, propertyKey: string) {
    // In den Metadaten nach dem ObjectManager suchen
    Object.defineProperty(target, propertyKey, {
      get() {
        let manager = Reflect.getMetadata(OBJECT_MANAGER_KEY, target);
        if (!manager) {
          // Falls kein Manager existiert, erstellen und setzen
          manager = new PDFObjectManager();
          Reflect.defineMetadata(OBJECT_MANAGER_KEY, manager, target);
        }
        return manager;
      },
      set(value: PDFObjectManager) {
        Reflect.defineMetadata(OBJECT_MANAGER_KEY, value, target);
      },
      enumerable: true,
      configurable: true,
    });
  };
}

// import { PDFObjectManager } from "./pdf-object-manager";

// // This helps me a lot: https://blog.jannikwempe.com/typescript-class-decorators-incl-dependency-injection-example
// export function InjectObjectManager() {
//   return function InjectObjectManager<T extends { new (...args: any[]): {} }>(
//     constructor: T
//   ): T | void {
//     // Replacing the original constructor with a new one that provides the injections from the Container
//     return class extends constructor {
//       constructor(...args: any[]) {
//         super(...args);
//         (this as any)._objectManager = new PDFObjectManager();
//       }
//     };
//   };
// }
