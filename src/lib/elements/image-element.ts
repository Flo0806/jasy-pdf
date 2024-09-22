// import { ImageRenderer } from "../renderer";
import { PDFObjectManager } from "../utils/pdf-object-manager";
import { InjectObjectManager } from "../utils/pdf-object-manager-decorator";
import { LayoutConstraints, SizedPDFElement } from "./pdf-element";

export abstract class CustomImage {
  abstract getBase64Data(): string | null | Promise<string> | Promise<null>;
  abstract loadAndConvertImage(): void | Promise<void>;
  abstract getImageType(): string | Promise<string>;
}

export abstract class CustomLocalImage extends CustomImage {
  private imagePath: string;
  private imageData: string | null = null;

  constructor(imagePath: string) {
    super();
    this.imagePath = imagePath;
  }

  async loadAndConvertImage(): Promise<void> {
    try {
      // Loading image and convert it to base64
      const image = await this.loadImage(this.imagePath);
      this.imageData = this.convertToBase64(image);
    } catch (error) {
      console.error("Error loading image:", error);
    }
  }

  async getImageType(): Promise<string> {
    const path = await import("path"); // Dynamic import
    const ext = path.extname(this.imagePath).toLowerCase();

    switch (ext) {
      case ".jpg":
      case ".jpeg":
        return "DCTDecode"; // For JPEG
      case ".png":
        return "FlateDecode"; // For PNG
      case ".bmp":
        throw new Error(
          "BMP is not directly supported. Please convert to PNG or JPEG."
        );
      case ".webp":
        throw new Error(
          "WebP is not directly supported. Please convert to PNG or JPEG."
        );
      default:
        throw new Error(`Unsupported image format: ${ext}`);
    }
  }

  private async loadImage(imagePath: string): Promise<Buffer> {
    const fs = await import("fs/promises"); // Dynamic import
    return fs.readFile(imagePath);
  }

  private convertToBase64(imageBuffer: Buffer): string {
    return imageBuffer.toString("base64");
  }

  getBase64Data(): string | null {
    return this.imageData;
  }
}

interface ImageElementParams {
  image: CustomImage; // Base64 or binary image data
  width?: number;
  height?: number;
}

export class ImageElement extends SizedPDFElement {
  private image: CustomImage;

  @InjectObjectManager()
  private _objectManager!: PDFObjectManager;

  constructor({
    image,
    width = Number.NaN,
    height = Number.NaN,
  }: ImageElementParams) {
    super({ x: 0, y: 0, width: width });

    this.image = image;
    this.width = width;
    this.height = height;
  }

  calculateLayout(parentConstraints?: LayoutConstraints): LayoutConstraints {
    if (parentConstraints) {
      this.x = parentConstraints.x || this.x;
      this.y = parentConstraints.y || this.y;
      this.width = parentConstraints.width || this.width;
      this.height = parentConstraints.height || this.height;
    }

    this.normalizeCoordinates();
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  normalizeCoordinates() {
    const pageHeight = this._objectManager.pageFormat[1];
    this.y = pageHeight - this.y - (this.height || 0); // Adjust Y to fit PDF coordinate system
  }

  override getProps() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      image: this.image,
    };
  }
}
