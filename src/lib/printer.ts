export function printInvoiceElement(elementId: string = "printable-bill-area") {
  if (typeof window === "undefined") return;
  window.print();
}
