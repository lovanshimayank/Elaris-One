import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { PDFParse } from "pdf-parse";

export interface ExtractedPdf {
  totalPages: number;
  pages: Array<{ pageNumber: number; text: string }>;
}

const resolveStoredPdf = (pdfUrl: string): string => {
  let pathname: string;

  try {
    pathname = pdfUrl.startsWith("/")
      ? pdfUrl.split(/[?#]/, 1)[0]
      : new URL(pdfUrl).pathname;
  } catch {
    throw new Error("Invalid PDF URL.");
  }

  // Support both the current and legacy Elaris-One download routes.
  const match = pathname.match(
    /^\/(?:api\/v1\/)?downloads\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9._-]+)$/
  );

  if (!match || match[2].includes("..")) {
    throw new Error(
      "This PDF is not stored in Elaris-One's supported local upload format. External and placeholder PDFs cannot be used for server-side quiz generation."
    );
  }

  const uploadsRoot = path.resolve(process.cwd(), "uploads");
  const filePath = path.resolve(uploadsRoot, match[1], match[2]);

  if (!filePath.startsWith(uploadsRoot + path.sep)) {
    throw new Error("Invalid PDF storage path.");
  }

  try {
    fsSync.accessSync(filePath);
  } catch {
    throw new Error(
      "The PDF file was not found in the local uploads folder. It may have been moved or deleted."
    );
  }

  return filePath;
};

export const extractPdfPages = async (
  pdfUrl: string,
  requestedPages?: number[]
): Promise<ExtractedPdf> => {
  const filePath = resolveStoredPdf(pdfUrl);
  const buffer = await fs.readFile(filePath);

  let parser: PDFParse | undefined;

  try {
    parser = new PDFParse({ data: buffer });

    const info = await parser.getInfo({ parsePageInfo: true });
    const totalPages = info.total;

    if (!Number.isInteger(totalPages) || totalPages < 1) {
      throw new Error("Could not determine the PDF page count.");
    }

    const pageNumbers = requestedPages?.length
      ? [...new Set(requestedPages)]
      : Array.from({ length: totalPages }, (_, index) => index + 1);

    if (
      pageNumbers.some(
        (page) => !Number.isInteger(page) || page < 1 || page > totalPages
      )
    ) {
      throw new Error("One or more requested pages are outside this PDF.");
    }

    const pages: ExtractedPdf["pages"] = [];

    for (const pageNumber of pageNumbers) {
      const result = await parser.getText({ partial: [pageNumber] });

      pages.push({
        pageNumber,
        text: result.text.trim(),
      });
    }

    return { totalPages, pages };
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
};

export const getPdfPageCount = async (pdfUrl: string): Promise<number> => {
  const filePath = resolveStoredPdf(pdfUrl);
  const buffer = await fs.readFile(filePath);
  const parser = new PDFParse({ data: buffer });

  try {
    const info = await parser.getInfo({ parsePageInfo: true });

    if (!Number.isInteger(info.total) || info.total < 1) {
      throw new Error("Could not determine the PDF page count.");
    }

    return info.total;
  } finally {
    await parser.destroy();
  }
};
