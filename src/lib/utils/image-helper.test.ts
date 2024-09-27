import { describe, it, expect } from "vitest";
import {
  applyContainFit,
  applyCoverFit,
  applyFillFit,
  applyFitNone,
} from "./image-helper";

describe("Image Fit Functions", () => {
  it("should apply contain fit correctly", () => {
    const result = applyContainFit(400, 300, 500, 500);
    expect(result.width).toBeCloseTo(500);
    expect(result.height).toBeCloseTo(375); // 400/300 = 1.33, so 500 / 1.33 = 375
    expect(result.offsetX).toBe(0);
    expect(result.offsetY).toBeCloseTo((500 - 375) / 2);
  });

  it("should apply cover fit correctly", () => {
    const result = applyCoverFit(400, 300, 500, 500);
    expect(result.width).toBeCloseTo(666.67); // scale height to match container height
    expect(result.height).toBeCloseTo(500);
    expect(result.offsetX).toBeCloseTo((500 - 666.67) / 2); // negative offset due to cover fit
    expect(result.offsetY).toBe(0);
  });

  it("should apply fill fit correctly", () => {
    const result = applyFillFit(500, 500);
    expect(result.width).toBe(500);
    expect(result.height).toBe(500);
    expect(result.offsetX).toBe(0);
    expect(result.offsetY).toBe(0);
  });

  it("should apply fit none correctly", () => {
    const result = applyFitNone(400, 300, 500, 500);
    expect(result.width).toBe(400);
    expect(result.height).toBe(300);
    expect(result.offsetX).toBeCloseTo((500 - 400) / 2);
    expect(result.offsetY).toBeCloseTo((500 - 300) / 2);
  });
});
