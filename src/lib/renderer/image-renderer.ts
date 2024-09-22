import { CustomImage, ImageElement } from "../elements/image-element";
import { PDFObjectManager } from "../utils/pdf-object-manager";
import { RendererRegistry } from "../utils/renderer-registry";

export class ImageRenderer {
  static async render(
    imageElement: ImageElement,
    objectManager: PDFObjectManager
  ): Promise<number> {
    // Zuerst das Bild laden und konvertieren
    const { x, y, width, height, image } = imageElement.getProps();
    await image.loadAndConvertImage(); // Image in Base64 laden
    const imageType = await image.getImageType(); // Beispielmethode für JPEG/PNG
    const base64Data = await image.getBase64Data();

    // Hier wird das Bild als Objekt hinzugefügt, inklusive der Länge des Bildstreams
    const imageObject = `
      << /Type /XObject
         /Subtype /Image
         /Width ${width}
         /Height ${height}
         /ColorSpace /DeviceRGB
         /BitsPerComponent 8
         /Filter /${imageType}
         /Length ${base64Data ? base64Data.length : 0} >>
      stream
      ${base64Data}
      endstream
    `;

    // Füge das Bild als Objekt dem PDF hinzu und bekomme die Objektnummer zurück
    const imageObjectNumber = objectManager.addObject(imageObject);

    // Jetzt können wir das Bild rendern, indem wir es an die entsprechende Position im PDF setzen
    const imagePlacement = `
      q
      ${width} 0 0 ${height} ${x} ${y} cm
      /Im${imageObjectNumber} Do
      Q
    `;

    // Füge die Bildplatzierung als Inhalt hinzu
    const contentObjectNumber = objectManager.addObject(
      `<</Length ${imagePlacement.length}>>\nstream\n${imagePlacement}endstream`
    );

    // Gib die Objektnummer zurück, falls nötig
    return contentObjectNumber;
  }
}
