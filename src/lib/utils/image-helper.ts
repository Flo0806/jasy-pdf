import * as fs from "fs/promises";

// Declare the new method in the DataView interface
declare global {
  interface DataView {
    getUint24(byteOffset: number, littleEndian?: boolean): number;
  }
}

// Implement the method to handle 24-bit integers
DataView.prototype.getUint24 = function (
  byteOffset: number,
  littleEndian: boolean = false
): number {
  const b1 = this.getUint8(byteOffset);
  const b2 = this.getUint8(byteOffset + 1);
  const b3 = this.getUint8(byteOffset + 2);
  return littleEndian
    ? (b3 << 16) | (b2 << 8) | b1
    : (b1 << 16) | (b2 << 8) | b3;
};

interface ImageDimensions {
  width: number;
  height: number;
}

export async function getImageDimensions(
  buffer: Buffer
): Promise<ImageDimensions> {
  const dataView = new DataView(buffer.buffer);

  // Check for JPEG (0xFFD8 is the start of JPEG file)
  if (dataView.getUint16(0) === 0xffd8) {
    let offset = 2;
    while (offset < buffer.byteLength) {
      const marker = dataView.getUint16(offset, false);
      offset += 2;
      if (marker === 0xffc0 || marker === 0xffc2) {
        // SOF0 or SOF2
        return {
          height: dataView.getUint16(offset + 3, false),
          width: dataView.getUint16(offset + 5, false),
        };
      } else {
        offset += dataView.getUint16(offset, false);
      }
    }
  }

  // Check for PNG (0x89504E47 is the PNG signature)
  if (dataView.getUint32(0) === 0x89504e47) {
    return {
      width: dataView.getUint32(16, false),
      height: dataView.getUint32(20, false),
    };
  }

  // Check for BMP (0x424D is the BMP signature)
  if (dataView.getUint16(0) === 0x424d) {
    return {
      width: dataView.getUint32(18, true),
      height: dataView.getUint32(22, true),
    };
  }

  // Check for WebP (0x52494646 is the WebP signature 'RIFF')
  if (
    dataView.getUint32(0) === 0x52494646 &&
    dataView.getUint32(8) === 0x57454250
  ) {
    // 'WEBP'
    if (dataView.getUint32(12) === 0x56503820) {
      // 'VP8 '
      return {
        width: dataView.getUint16(26, true),
        height: dataView.getUint16(28, true),
      };
    } else if (dataView.getUint32(12) === 0x56503858) {
      // 'VP8X'
      return {
        width: dataView.getUint24(24, true) + 1,
        height: dataView.getUint24(27, true) + 1,
      };
    }
  }

  throw new Error("Unsupported image format");
}
