import { pageFormats, PageSize } from "../constants/page-sizes";
import {
  ColorMode,
  DefaultFont,
  Margin,
  Orientation,
  PDFConfig,
} from "../renderer";
import { PDFObjectManager } from "../utils/pdf-object-manager";
import { InjectObjectManager } from "../utils/pdf-object-manager-decorator";
import { LayoutConstraints, PDFElement, WithChildren } from "./pdf-element";
import { TextElement } from "./text-element";

export interface PDFPageConfig {
  pageSize?: PageSize;
  orientation?: Orientation;
  margin?: Margin;
  colorMode?: ColorMode;
  defaultFont?: DefaultFont;
}

interface PDFPageParams extends WithChildren {
  config?: PDFPageConfig;
}
export class PageElement extends PDFElement {
  @InjectObjectManager()
  private _objectManager!: PDFObjectManager;

  private config!: PDFPageConfig;
  private children: PDFElement[];

  constructor({ children, config }: PDFPageParams) {
    super();
    this.children = children;
    this.config = this._objectManager.getPDFConfig();
    if (config) this.config = { ...this.config, ...config };
    this._objectManager.setCurrentPageConfig(this.config);
  }

  calculateLayout(parentConstraints: LayoutConstraints): LayoutConstraints {
    // We know that we set a minimum standard pdf config inside the PDFObjectManager. So margin must have a value!
    const result = {
      x: 0 + this.config.margin!.left,
      y: 0 + this.config.margin!.top,
      width:
        pageFormats[this.config.pageSize!][0] -
        this.config.margin!.left -
        this.config.margin!.right,
      height:
        pageFormats[this.config.pageSize!][1] -
        this.config.margin!.top -
        this.config.margin!.bottom,
    };
    if (this.config.orientation === Orientation.landscape) {
      const _width = result.width;
      result.width = result.height;
      result.height = _width;
    }
    // Update 30.09.2024. Now we have some settings and we must do something! Starting with the dimensions/margins:
    this.children.forEach((child) => child.calculateLayout(result));
    return result;
  }

  override getProps(): PDFPageParams {
    return { children: this.children, config: this.config };
  }

  addTextElement(element: TextElement) {
    this.children.push(element);
    return this;
  }
}
