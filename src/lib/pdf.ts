export function generatePdfDownload(invoiceNo: string, elementId: string = "printable-bill-area") {
  if (typeof window === "undefined") return;
  window.print();
}
