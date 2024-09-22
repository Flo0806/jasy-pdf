import "reflect-metadata";
import { PDFObjectManager } from "./pdf-object-manager";

const OBJECT_MANAGER_KEY = Symbol("PDFObjectManager");

// Decorator to inject the `PDFObjectManager` globaly
// This helps me a lot: https://blog.jannikwempe.com/typescript-class-decorators-incl-dependency-injection-example
export function InjectObjectManager() {
  return function (target: any, propertyKey: string) {
    // In den Metadaten nach dem ObjectManager suchen
    Object.defineProperty(target, propertyKey, {
      get() {
        let manager = Reflect.getMetadata(OBJECT_MANAGER_KEY, Reflect);
        if (!manager) {
          // Falls kein Manager existiert, erstellen und setzen
          manager = new PDFObjectManager();
          Reflect.defineMetadata(OBJECT_MANAGER_KEY, manager, Reflect);
        }
        return manager;
      },
      set(value: PDFObjectManager) {
        Reflect.defineMetadata(OBJECT_MANAGER_KEY, value, Reflect);
      },
      enumerable: true,
      configurable: true,
    });
  };
}
