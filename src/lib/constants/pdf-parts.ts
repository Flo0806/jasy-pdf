export const PDF_PARTS = {
  HEADER: "%PDF-1.3",
  TRAILER: (size: number) => `trailer\n<< /Size ${size} >>\nstartxref\n%%EOF`,
  XREF: "xref", // Placeholder for xref elements
};
