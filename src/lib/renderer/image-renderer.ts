import { BoxFit, ImageElement } from "../elements/image-element";
import {
  applyContainFit,
  applyCoverFit,
  applyFillFit,
  applyFitNone,
} from "../utils/image-helper";
import { PDFObjectManager } from "../utils/pdf-object-manager";

export class ImageRenderer {
  static async render(
    imageElement: ImageElement,
    objectManager: PDFObjectManager
  ): Promise<string> {
    // Load the image and convert it in a binary string
    let { x, y, width, height, image, fit } = imageElement.getProps();
    await image.init(); // Load and initialize the image
    const imageType = await image.getImageType(); // For the moment we can handle `png` and `jpg/jpeg` files
    const fileData = await image.getFileData();
    const dimensions = await image.getImageDimensions();

    if (!fileData) {
      throw new Error("File data cannot be `null`");
    }

    // Now we check the `fit` property and changing the dimensions of the image
    // Optionally we must add an overflow container
    let mustCreateOverflowContainer: boolean = false;
    const containerDimensions = JSON.parse(
      JSON.stringify({ x, y, width, height })
    ); // Deep clone images dimensions
    switch (fit) {
      case BoxFit.cover:
        mustCreateOverflowContainer = true;
        const fitCoverResult = applyCoverFit(
          dimensions.width,
          dimensions.height,
          width || 0,
          height || 0
        );
        x += fitCoverResult.offsetX;
        y += fitCoverResult.offsetY;
        width = fitCoverResult.width;
        height = fitCoverResult.height;
        break;
      case BoxFit.contain:
        mustCreateOverflowContainer = true;
        const fitContainResult = applyContainFit(
          dimensions.width,
          dimensions.height,
          width || 0,
          height || 0
        );
        x += fitContainResult.offsetX;
        y += fitContainResult.offsetY;
        width = fitContainResult.width;
        height = fitContainResult.height;
        break;
      case BoxFit.none:
        const fitNoneResult = applyFitNone(
          dimensions.width,
          dimensions.height,
          width || 0,
          height || 0
        );
        x += fitNoneResult.offsetX;
        y += fitNoneResult.offsetY;
        width = fitNoneResult.width;
        height = fitNoneResult.height;
        break;
      case BoxFit.fill:
        const fitFillResult = applyFillFit(width || 0, height || 0);
        width = fitFillResult.width;
        height = fitFillResult.height;
    }

    const imageObjectNumber = objectManager.registerImage(
      dimensions.width,
      dimensions.height,
      imageType,
      fileData
    );

    // Now we can render the image... create the image placement code
    const imagePlacement = mustCreateOverflowContainer
      ? `q
${containerDimensions.x} ${containerDimensions.y} ${containerDimensions.width} ${containerDimensions.height} re 
W n 
q
${width} 0 0 ${height} ${x} ${y} cm
/IM${imageObjectNumber} Do
Q
Q
`
      : `q
${width} 0 0 ${height} ${x} ${y} cm
/IM${imageObjectNumber} Do
Q
`;
    return imagePlacement;
  }
}
