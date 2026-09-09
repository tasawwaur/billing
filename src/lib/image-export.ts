/**
 * High Quality JPG Image Export & WhatsApp Image Sharing for Invoices & Bills
 * Produces 300+ DPI sharp, high-definition JPEG images
 * Fully optimized for both Mobile and Desktop with ZERO cut-off on any screen width
 */

/**
 * Renders the bill element to a high-definition HTMLCanvasElement.
 * Automatically guarantees standard 800px A4 invoice width on all devices (mobile & desktop),
 * preventing any cutoff of right-side columns, header, or totals.
 */
async function renderBillToCanvas(elementId: string = "printable-bill-area"): Promise<HTMLCanvasElement | null> {
  if (typeof window === "undefined") return null;
  const element = document.getElementById(elementId);
  if (!element) return null;

  try {
    const html2canvasModule = await import("html2canvas").catch(() => null);
    if (!html2canvasModule) return null;
    const html2canvas = html2canvasModule.default || html2canvasModule;

    // Detect if this is a thermal receipt (58mm or 80mm) vs full A4 invoice
    const isThermal =
      element.classList.contains("w-[300px]") ||
      element.classList.contains("w-[220px]") ||
      (element.offsetWidth > 0 && element.offsetWidth < 350);

    const targetWidth = isThermal ? (element.offsetWidth || 300) : 800;
    const containerWidth = targetWidth + 50;

    const canvas = await html2canvas(element, {
      scale: 3, // ~300 DPI ultra-sharp print rendering
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 15000,
      scrollX: 0,
      scrollY: 0,
      windowWidth: Math.max(window.innerWidth || 0, containerWidth),
      width: targetWidth,
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById(elementId);
        if (clonedEl) {
          // Force exact standard width so table, header, and totals are 100% visible
          clonedEl.style.width = `${targetWidth}px`;
          clonedEl.style.minWidth = `${targetWidth}px`;
          clonedEl.style.maxWidth = `${targetWidth}px`;
          clonedEl.style.boxSizing = "border-box";
          clonedEl.style.margin = "0 auto";
          clonedEl.style.display = "block";
          clonedEl.style.overflow = "visible";
          clonedEl.style.transform = "none";

          clonedDoc.documentElement.style.width = `${containerWidth}px`;
          clonedDoc.documentElement.style.minWidth = `${containerWidth}px`;
          clonedDoc.documentElement.style.overflow = "visible";

          clonedDoc.body.style.width = `${containerWidth}px`;
          clonedDoc.body.style.minWidth = `${containerWidth}px`;
          clonedDoc.body.style.overflow = "visible";
          clonedDoc.body.style.margin = "0";
          clonedDoc.body.style.padding = "0";

          let parent = clonedEl.parentElement;
          while (parent && parent !== clonedDoc.body) {
            parent.style.width = `${containerWidth}px`;
            parent.style.minWidth = `${containerWidth}px`;
            parent.style.maxWidth = "none";
            parent.style.overflow = "visible";
            parent.style.padding = "0";
            parent.style.margin = "0 auto";
            parent.style.transform = "none";
            parent = parent.parentElement;
          }
        }
      },
    });

    return canvas;
  } catch (err) {
    console.error("renderBillToCanvas error:", err);
    return null;
  }
}

/**
 * Fallback SVG Canvas render in High Resolution if html2canvas fails
 */
async function fallbackSvgDownload(fileName: string, elementId: string): Promise<boolean> {
  if (typeof document === "undefined") return false;
  const element = document.getElementById(elementId);
  if (!element) return false;

  try {
    const htmlContent = element.outerHTML;
    const isThermal =
      element.classList.contains("w-[300px]") ||
      element.classList.contains("w-[220px]") ||
      (element.offsetWidth > 0 && element.offsetWidth < 350);
    const width = isThermal ? (element.offsetWidth || 300) : 800;
    const height = element.offsetHeight || 1000;
    const scale = 3;

    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;">
            ${htmlContent}
          </div>
        </foreignObject>
      </svg>
    `;

    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    return new Promise<boolean>((resolve) => {
      img.onload = () => {
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);
          const imgData = canvas.toDataURL("image/jpeg", 0.98);
          const a = document.createElement("a");
          a.href = imgData;
          a.download = fileName;
          a.click();
          URL.revokeObjectURL(url);
          resolve(true);
        } else {
          resolve(false);
        }
      };
      img.onerror = () => resolve(false);
      img.src = url;
    });
  } catch (err) {
    console.error("SVG fallback error:", err);
    return false;
  }
}

/**
 * Downloads invoice as ultra HD JPEG file
 */
export async function downloadInvoiceAsImage(
  invoiceNo: string,
  customerName?: string,
  elementId: string = "printable-bill-area"
): Promise<boolean> {
  const cleanCustName = customerName
    ? customerName.trim().replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_")
    : "";
  const cleanInvNo = invoiceNo.replace(/[^a-zA-Z0-9-_]/g, "");
  const downloadFileName = cleanCustName
    ? `${cleanInvNo}_${cleanCustName}_Bill.jpg`
    : `${cleanInvNo}_Bill.jpg`;

  const canvas = await renderBillToCanvas(elementId);
  if (!canvas) {
    return fallbackSvgDownload(downloadFileName, elementId);
  }

  if (canvas.toBlob) {
    return new Promise<boolean>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = downloadFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
            resolve(true);
          } else {
            const imgData = canvas.toDataURL("image/jpeg", 0.98);
            const a = document.createElement("a");
            a.href = imgData;
            a.download = downloadFileName;
            a.click();
            resolve(true);
          }
        },
        "image/jpeg",
        0.98 // 98% Ultra-HD JPEG quality
      );
    });
  } else {
    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const a = document.createElement("a");
    a.href = imgData;
    a.download = downloadFileName;
    a.click();
    return true;
  }
}

/**
 * Copies the bill image directly to the user's Clipboard as an image.
 * When the user switches to WhatsApp and presses Ctrl+V (Paste),
 * the bill image is immediately pasted into the chat ready to send!
 */
export async function copyInvoiceImageToClipboard(
  elementId: string = "printable-bill-area"
): Promise<boolean> {
  if (typeof window === "undefined" || !navigator.clipboard) return false;
  const canvas = await renderBillToCanvas(elementId);
  if (!canvas) return false;

  return new Promise<boolean>((resolve) => {
    if (!canvas.toBlob) {
      resolve(false);
      return;
    }
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      try {
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        resolve(true);
      } catch (clipErr) {
        console.warn("Clipboard write error:", clipErr);
        resolve(false);
      }
    }, "image/png");
  });
}

/**
 * Returns the invoice image as a File object (JPG) for Web Share API
 */
export async function getInvoiceImageFile(
  invoiceNo: string,
  customerName?: string,
  elementId: string = "printable-bill-area"
): Promise<File | null> {
  if (typeof window === "undefined") return null;
  const canvas = await renderBillToCanvas(elementId);
  if (!canvas) return null;

  const cleanCustName = customerName
    ? customerName.trim().replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_")
    : "";
  const cleanInvNo = invoiceNo.replace(/[^a-zA-Z0-9-_]/g, "");
  const fileName = cleanCustName
    ? `${cleanInvNo}_${cleanCustName}_Bill.jpg`
    : `${cleanInvNo}_Bill.jpg`;

  return new Promise<File | null>((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const file = new File([blob], fileName, { type: "image/jpeg" });
        resolve(file);
      },
      "image/jpeg",
      0.98
    );
  });
}
