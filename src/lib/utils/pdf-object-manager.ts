export class PDFObjectManager {
  private objects: string[] = [];
  private objectPositions: number[] = [];
  private parentObjectNumber: number = 0;

  // Add an object and return its number
  addObject(content: string): number {
    const objectNumber = this.objects.length + 1;
    this.objects.push(content);
    return objectNumber;
  }

  // Set the parent object
  setParentObjectNumber(number: number) {
    this.parentObjectNumber = number;
  }

  // Get the parent object
  getParentObjectNumber(): number {
    return this.parentObjectNumber;
  }

  // Returns all rendered objects as string
  getRenderedObjects(): string {
    let result = "";
    this.objects.forEach((content, index) => {
      const position = result.length;
      this.objectPositions.push(position);
      result += `${index + 1} 0 obj\n${content}\nendobj\n`;
    });
    return result;
  }

  // Returns the Cross-Reference table
  getXRefTable(): string {
    let xref = "xref\n";
    xref += `0 ${this.objects.length + 1}\n`;
    xref += `0000000000 65535 f \n`;

    this.objectPositions.forEach((pos) => {
      xref += `${pos.toString().padStart(10, "0")} 00000 n \n`;
    });

    return xref;
  }

  // Calculating the position of the XRef table and returns the trailer
  getTrailerAndXRef(startxref: number): string {
    const objectCount = this.getObjectCount();
    return `trailer\n<< /Size ${
      objectCount + 1
    } /Root 4 0 R >>\nstartxref\n${startxref}\n%%EOF`;
  }

  // Returns the object count
  getObjectCount(): number {
    return this.objects.length;
  }
}
