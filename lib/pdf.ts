import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";
import { CONTRACT, buildContractParagraphs } from "./contract";

export type CessionData = {
  nom: string;
  prenom: string;
  adresse: string;
  signature: string; // data URL (image/png)
  date?: Date;
};

// Browser-safe base64 → bytes (no Node Buffer dependency).
function base64ToBytes(base64: string): Uint8Array {
  const binary =
    typeof atob === "function"
      ? atob(base64)
      : // Fallback for any non-browser context.
        (globalThis as any).Buffer.from(base64, "base64").toString("binary");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

const A4 = { width: 595.28, height: 841.89 };
const MARGIN = 56;
const CONTENT_WIDTH = A4.width - MARGIN * 2;

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function generateCessionPdf(data: CessionData): Promise<Uint8Array> {
  const date = data.date ?? new Date();
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page: PDFPage = doc.addPage([A4.width, A4.height]);
  let y = A4.height - MARGIN;

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN) {
      page = doc.addPage([A4.width, A4.height]);
      y = A4.height - MARGIN;
    }
  };

  const drawParagraph = (
    text: string,
    { size = 10.5, useFont = font, gap = 6, lineHeight = 14 } = {}
  ) => {
    const lines = wrapText(text, useFont, size, CONTENT_WIDTH);
    for (const line of lines) {
      ensureSpace(lineHeight);
      page.drawText(line, {
        x: MARGIN,
        y,
        size,
        font: useFont,
        color: rgb(0.09, 0.11, 0.15),
      });
      y -= lineHeight;
    }
    y -= gap;
  };

  // Title
  const titleSize = 15;
  const titleWidth = bold.widthOfTextAtSize(CONTRACT.title, titleSize);
  page.drawText(CONTRACT.title, {
    x: (A4.width - titleWidth) / 2,
    y,
    size: titleSize,
    font: bold,
    color: rgb(0.06, 0.36, 0.33),
  });
  y -= 30;

  // Body
  for (const para of buildContractParagraphs({
    nom: data.nom,
    prenom: data.prenom,
    adresse: data.adresse,
    date,
  })) {
    if (para.heading) {
      drawParagraph(para.heading, { useFont: bold, size: 11, gap: 3 });
    }
    drawParagraph(para.text);
  }

  // Signature block
  ensureSpace(140);
  y -= 10;

  const colWidth = CONTENT_WIDTH / 2;
  const leftX = MARGIN;
  const rightX = MARGIN + colWidth;
  const blockTop = y;

  page.drawText("Nom et Signature — Le Cédant", {
    x: leftX,
    y: blockTop,
    size: 10.5,
    font: bold,
    color: rgb(0.09, 0.11, 0.15),
  });
  page.drawText(`${data.prenom} ${data.nom}`, {
    x: leftX,
    y: blockTop - 16,
    size: 10.5,
    font,
    color: rgb(0.09, 0.11, 0.15),
  });

  page.drawText("Nom et Signature — Le Cessionnaire", {
    x: rightX,
    y: blockTop,
    size: 10.5,
    font: bold,
    color: rgb(0.09, 0.11, 0.15),
  });
  page.drawText(CONTRACT.cessionnaireSignataires, {
    x: rightX,
    y: blockTop - 16,
    size: 10.5,
    font,
    color: rgb(0.09, 0.11, 0.15),
  });

  // Embed the cédant signature image under the left column.
  try {
    const base64 = data.signature.split(",")[1] ?? "";
    if (base64) {
      const bytes = base64ToBytes(base64);
      const png = await doc.embedPng(bytes);
      const maxW = colWidth - 20;
      const maxH = 70;
      const scale = Math.min(maxW / png.width, maxH / png.height, 1);
      const w = png.width * scale;
      const h = png.height * scale;
      page.drawImage(png, {
        x: leftX,
        y: blockTop - 30 - h,
        width: w,
        height: h,
      });
    }
  } catch {
    // If the signature cannot be embedded, keep the rest of the PDF intact.
  }

  return doc.save();
}
