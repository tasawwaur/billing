import { Bill } from "@/types/bill";
import { StoreSettings } from "@/types/store";

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

  // Try using html2canvas + jsPDF if available
  try {
    const html2canvasModule = await import("html2canvas").catch(() => null);
    const jsPDFModule = await import("jspdf").catch(() => null);

    if (html2canvasModule && jsPDFModule) {
      const html2canvas = html2canvasModule.default || html2canvasModule;
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule;

      const element = document.getElementById(elementId);
      if (element) {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
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

        return { file, blob, fileName };
      }
    }
  } catch (err) {
    console.warn("jsPDF dynamic load error, using SVG Blob fallback:", err);
  }

  // Fallback: Generate SVG / Canvas PDF Blob
  const element = document.getElementById(elementId);
  const htmlContent = element
    ? element.outerHTML
    : `
    <div style="font-family: Arial, sans-serif; padding: 30px; color: #111;">
      <h1 style="color: #d4af37;">${settings.storeName} - TAX INVOICE</h1>
      <p>Invoice No: <strong>${bill.invoiceNo}</strong></p>
      <p>Date: ${new Date(bill.date).toLocaleDateString("en-IN")}</p>
      <p>Customer: ${bill.customerName} (${bill.customerPhone})</p>
      <hr/>
      <h3>Grand Total: ₹${bill.calculation.grandTotal.toLocaleString("en-IN")}</h3>
    </div>
  `;

  const width = 800;
  const height = 1130;
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${htmlContent}
        </div>
      </foreignObject>
    </svg>
  `;

  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const pdfFile = new File([blob], fileName, { type: "application/pdf" });

            if (downloadFile) {
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = fileName;
              a.click();
            }

            resolve({ file: pdfFile, blob, fileName });
          } else {
            resolve(null);
          }
          URL.revokeObjectURL(url);
        }, "application/pdf");
      } else {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
