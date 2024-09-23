import { ImageElement } from "../elements/image-element";
import { PDFObjectManager } from "../utils/pdf-object-manager";

export class ImageRenderer {
  static async render(
    imageElement: ImageElement,
    objectManager: PDFObjectManager
  ): Promise<string> {
    // Load the image and convert it in a binary string
    const { x, y, width, height, image } = imageElement.getProps();
    await image.loadAndConvertImage(); // Load and initialize the image
    const imageType = await image.getImageType(); // For the moment we can handle `png` and `jpg/jpeg` files
    const fileData = await image.getFileData();
    const dimensions = await image.getImageDimensions();

    if (!fileData) {
      throw new Error("File data cannot be `null`");
    }

    const imageObjectNumber = objectManager.registerImage(
      dimensions.width,
      dimensions.height,
      imageType,
      fileData
    );

    // Now we can render the image... create the image placement code

    const imagePlacement = `q
${x} ${y + (height || 0) - 100} ${width} 100 re 
W n 
q
${width} 0 0 ${height} ${x} ${y} cm
/IM${imageObjectNumber} Do
Q
Q
`;
    return imagePlacement;
  }
}
