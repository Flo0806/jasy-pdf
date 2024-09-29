import { PDFDocumentElement } from "../elements/pdf-document-element";
import { PDFDocumentRenderer } from "./pdf-document-renderer";
import { PDFObjectManager } from "../utils/pdf-object-manager";
import { RendererRegistry } from "../utils/renderer-registry";
import {
  ExpandedElement,
  ImageElement,
  LineElement,
  PaddingElement,
  TextElement,
} from "../elements";
import { TextRenderer } from "./text-renderer";
import { ContainerElement } from "../elements/container-element";
import { RectangleElement } from "../elements/rectangle-element";
import { ContainerRenderer } from "./container-renderer";
import { RectangleRenderer } from "./rectangle-renderer";
import { ExpandedRenderer } from "./expanded-renderer";
import { PaddingRenderer } from "./padding-renderer";
import { InjectObjectManager } from "../utils/pdf-object-manager-decorator";
import { ImageRenderer } from "./image-renderer";
import { LineRenderer } from "./line-renderer";

export class PDFRenderer {
  @InjectObjectManager()
  private static _objectManager: PDFObjectManager;

  static async render(document: PDFDocumentElement): Promise<string> {
    // Register all Renderer
    RendererRegistry.register(TextElement, TextRenderer.render);
    RendererRegistry.register(ContainerElement, ContainerRenderer.render);
    RendererRegistry.register(RectangleElement, RectangleRenderer.render);
    RendererRegistry.register(ExpandedElement, ExpandedRenderer.render);
    RendererRegistry.register(PaddingElement, PaddingRenderer.render);
    RendererRegistry.register(ImageElement, ImageRenderer.render);
    RendererRegistry.register(LineElement, LineRenderer.render);

    let pdfContent = "";

    // Header
    pdfContent += "%PDF-1.4\n";

    document.calculateLayout();
    // Render pages and contents
    await PDFDocumentRenderer.render(document, PDFRenderer._objectManager);

    // Add catalog objects
    const catalogObject = `<< /Type /Catalog /Pages ${PDFRenderer._objectManager.getParentObjectNumber()} 0 R >>`;
    PDFRenderer._objectManager.addObject(catalogObject);

    // Add rendered objects
    pdfContent += PDFRenderer._objectManager.getRenderedObjects();

    // Add XRef table and trailer
    const startxref = pdfContent.length;
    pdfContent += PDFRenderer._objectManager.getXRefTable();
    pdfContent += PDFRenderer._objectManager.getTrailerAndXRef(startxref);

    return pdfContent;
  }
}
