export const PDF_PARTS = {
  HEADER: "%PDF-1.4",
  TRAILER: (size: number) => `trailer\n<< /Size ${size} >>\nstartxref\n%%EOF`,
  XREF: "xref", // Platzhalter für XRef-Tabelle
};
