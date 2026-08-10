export async function downloadInvoiceAsImage(
  invoiceNo: string,
  customerName?: string,
  elementId: string = "printable-bill-area"
) {
  if (typeof window === "undefined") return;
  const element = document.getElementById(elementId);
  if (!element) return;

  const cleanCustName = customerName
    ? customerName.trim().replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_")
    : "";
  const downloadFileName = cleanCustName
    ? `${invoiceNo}_${cleanCustName}_Invoice.png`
    : `${invoiceNo}_Invoice.png`;

  try {
    const html2canvasModule = await import("html2canvas").catch(() => null);
    if (html2canvasModule) {
      const html2canvas = html2canvasModule.default || html2canvasModule;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = imgData;
      a.download = downloadFileName;
      a.click();
      return;
    }
  } catch (err) {
    console.warn("html2canvas image export fallback:", err);
  }

  // Fallback SVG Canvas render
  const htmlContent = element.outerHTML;
  const width = element.offsetWidth || 800;
  const height = element.offsetHeight || 1000;

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${htmlContent}
        </div>
      </foreignObject>
    </svg>
  `;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const img = new Image();
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
      const imgData = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = imgData;
      a.download = downloadFileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  img.src = url;
}
