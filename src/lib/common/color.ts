export class Color {
  private r: number;
  private g: number;
  private b: number;

  constructor(r: number, g: number, b: number) {
    this.r = this.clampColorValue(r, "r");
    this.g = this.clampColorValue(g, "g");
    this.b = this.clampColorValue(b, "b");
  }

  /**
   * Ensures that the color value is between 0 and 255. If the value is outside of this range,
   * it is clamped to the nearest valid value (0 or 255), and a warning is logged.
   *
   * @param value The color value to be clamped.
   * @param channel The color channel being adjusted ('r', 'g', or 'b').
   * @returns The clamped value between 0 and 255.
   */
  private clampColorValue(value: number, channel: string): number {
    if (value < 0 || value > 255) {
      console.warn(
        `Warning: ${channel} value ${value} is out of range (0-255). Clamping to valid range.`
      );
    }
    return Math.max(0, Math.min(255, value));
  }

  /**
   * Converts the current color to grayscale based on the perceived luminance of the color.
   *
   * The method uses a weighted sum to calculate the grayscale value, accounting for the
   * human eye's sensitivity to different colors:
   * - Red (R) contributes 30% to the overall brightness.
   * - Green (G) contributes 59% to the overall brightness.
   * - Blue (B) contributes 11% to the overall brightness.
   *
   * The resulting grayscale value is applied equally to the red, green, and blue channels,
   * producing a shade of gray that represents the original color's perceived brightness.
   *
   * @returns {Color} A new `Color` instance where the red, green, and blue components are equal,
   *                  forming a grayscale color.
   */
  toGrayscale(): Color {
    const gray = Math.round(0.3 * this.r + 0.59 * this.g + 0.11 * this.b);
    return new Color(gray, gray, gray);
  }

  // Returns the color as array `[number, number, number]`
  toArray(): [number, number, number] {
    return [this.r, this.g, this.b];
  }

  // Returns a PDF compatible color string
  toPDFColorString(): string {
    const [r, g, b] = this.toArray();
    return `${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(
      3
    )}`;
  }
}
