import { getImageDimensions } from "../utils/image-helper";
import { PDFObjectManager } from "../utils/pdf-object-manager";
import { InjectObjectManager } from "../utils/pdf-object-manager-decorator";
import { LayoutConstraints, SizedPDFElement } from "./pdf-element";

export abstract class CustomImage {
  abstract loadAndConvertImage(): void | Promise<void>;
  abstract getImageType(): string | Promise<string>;
  abstract getFileData(): string | Promise<string>;
  abstract getImageDimensions(): Promise<{ width: number; height: number }>;
}

export class CustomLocalImage extends CustomImage {
  private imagePath: string;
  private fileBuffer!: Buffer;
  private fileRawData!: string;

  constructor(imagePath: string) {
    super();
    this.imagePath = imagePath;
  }

  async loadAndConvertImage(): Promise<void> {
    try {
      // Loading image and convert it to base64
      await this.loadImage(this.imagePath);
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
    const result = await fs.readFile(imagePath);
    this.fileBuffer = result;
    this.fileRawData = result.toString("binary");
    return result;
  }

  getFileData(): string {
    return this.fileRawData;
  }

  async getImageDimensions(): Promise<{ width: number; height: number }> {
    if (!this.fileBuffer) {
      throw new Error("You must first call the `loadAndConvertImage` method");
    }

    const dimensions = await getImageDimensions(this.fileBuffer);
    return dimensions;
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
      this.height = (parentConstraints.height || this.height || 0) + 100;
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