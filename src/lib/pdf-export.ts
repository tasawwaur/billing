import { Bill } from "@/types/bill";
import { StoreSettings } from "@/types/store";

function getOrCreateBillElement(
  bill: Bill,
  settings: StoreSettings,
  elementId: string
): { element: HTMLElement; temporary: boolean } {
  if (typeof document === "undefined") {
    throw new Error("Document is undefined");
  }

  const existing = document.getElementById(elementId);
  if (existing) {
    return { element: existing, temporary: false };
  }

  const itemsRows = bill.items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px; text-align: left;">${item.productName}</td>
      <td style="padding: 10px; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; text-align: right;">₹${item.price.toLocaleString("en-IN")}</td>
      <td style="padding: 10px; text-align: right;">₹${item.total.toLocaleString("en-IN")}</td>
    </tr>
  `
    )
    .join("");

  const tempContainer = document.createElement("div");
  tempContainer.id = "temp-pdf-export-container";
  tempContainer.style.position = "absolute";
  tempContainer.style.left = "-9999px";
  tempContainer.style.top = "-9999px";
  tempContainer.style.width = "794px";
  tempContainer.style.backgroundColor = "#ffffff";
  tempContainer.style.color = "#111111";
  tempContainer.style.fontFamily = "'Helvetica Neue', Arial, sans-serif";
  tempContainer.style.padding = "32px";

  tempContainer.innerHTML = `
    <div style="border: 2px solid #d4af37; padding: 28px; border-radius: 12px; background: #ffffff;">
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #d4af37; padding-bottom: 16px;">
        <div>
          <h1 style="margin: 0; color: #111111; font-size: 24px; font-weight: 800; letter-spacing: 1px;">${settings.storeName.toUpperCase()}</h1>
          <p style="margin: 4px 0 0; color: #555555; font-size: 12px;">${settings.address}</p>
          <p style="margin: 2px 0 0; color: #555555; font-size: 12px;">GSTIN: ${settings.gstin || "N/A"} | Ph: ${settings.phone}</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; color: #d4af37; font-size: 20px; font-weight: bold;">TAX INVOICE</h2>
          <p style="margin: 4px 0 0; font-size: 14px; font-weight: bold;"># ${bill.invoiceNo}</p>
          <p style="margin: 2px 0 0; font-size: 12px; color: #555555;">Date: ${new Date(bill.date).toLocaleDateString("en-IN")}</p>
        </div>
      </div>

      <div style="margin: 16px 0; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 12px;">
        <p style="margin: 0;"><strong>Billed To:</strong> ${bill.customerName}</p>
        <p style="margin: 4px 0 0;"><strong>Phone:</strong> ${bill.customerPhone}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px;">
        <thead>
          <tr style="background: #0f172a; color: #ffffff;">
            <th style="padding: 10px; text-align: left;">Item Description</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Rate</th>
            <th style="padding: 10px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div style="display: flex; justify-content: space-between; border-top: 2px solid #d4af37; padding-top: 16px; margin-top: 16px; font-size: 13px;">
        <div>
          <p style="margin: 0; font-size: 11px; color: #555555;">Payment Mode: <strong>${bill.paymentMethod}</strong></p>
          <p style="margin: 4px 0 0; font-size: 11px; color: #555555;">Status: <strong>${bill.paymentStatus}</strong></p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0;">Subtotal: <strong>₹${bill.calculation.subtotal.toLocaleString("en-IN")}</strong></p>
          ${bill.calculation.discount > 0 ? `<p style="margin: 2px 0 0; color: #e11d48;">Discount: -₹${bill.calculation.discount.toLocaleString("en-IN")}</p>` : ""}
          ${bill.calculation.totalTax > 0 ? `<p style="margin: 2px 0 0;">GST Tax: ₹${bill.calculation.totalTax.toLocaleString("en-IN")}</p>` : ""}
          <h3 style="margin: 8px 0 0; font-size: 18px; color: #d4af37;">Grand Total: ₹${bill.calculation.grandTotal.toLocaleString("en-IN")}</h3>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(tempContainer);
  return { element: tempContainer, temporary: true };
}

export async function generateBillPDF(
  bill: Bill,
  settings: StoreSettings,
  elementId: string = "printable-bill-area",
  downloadFile: boolean = false
): Promise<{ file: File; blob: Blob; fileName: string } | null> {
  if (typeof window === "undefined") return null;

  const cleanCustName = bill.customerName
    ? bill.customerName.trim().replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_")
    : "";
  const fileName = cleanCustName
    ? `${bill.invoiceNo}_${cleanCustName}_Tax_Invoice.pdf`
    : `${bill.invoiceNo}_Tax_Invoice.pdf`;

  let elementInfo: { element: HTMLElement; temporary: boolean } | null = null;

  try {
    elementInfo = getOrCreateBillElement(bill, settings, elementId);
    const html2canvasModule = await import("html2canvas").catch(() => null);
    const jsPDFModule = await import("jspdf").catch(() => null);

    if (html2canvasModule && jsPDFModule && elementInfo?.element) {
      const html2canvas = html2canvasModule.default || html2canvasModule;
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule;

      const canvas = await html2canvas(elementInfo.element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

      const blob = pdf.output("blob");
      const file = new File([blob], fileName, { type: "application/pdf" });

      if (downloadFile) {
        pdf.save(fileName);
      }

      if (elementInfo.temporary && elementInfo.element.parentNode) {
        elementInfo.element.parentNode.removeChild(elementInfo.element);
      }

      return { file, blob, fileName };
    }
  } catch (err) {
    console.warn("jsPDF error, cleaning up and returning fallback:", err);
  } finally {
    if (elementInfo?.temporary && elementInfo.element.parentNode) {
      elementInfo.element.parentNode.removeChild(elementInfo.element);
    }
  }

  return null;
}
