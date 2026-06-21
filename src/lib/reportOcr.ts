import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.mjs',
  import.meta.url
).toString();

type StatusCallback = (message: string) => void;

async function runTesseract(source: File | HTMLCanvasElement, onStatus?: StatusCallback): Promise<string> {
  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        onStatus?.(`Reading the report card... ${Math.round((m.progress || 0) * 100)}%`);
      }
    },
  });

  try {
    const result = await worker.recognize(source);
    return result.data.text.trim();
  } finally {
    await worker.terminate();
  }
}

async function renderPdfPageToCanvas(page: pdfjsLib.PDFPageProxy): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) throw new Error('Could not prepare a canvas for PDF OCR.');

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvas, canvasContext: context, viewport }).promise;
  return canvas;
}

async function extractPdfText(file: File, onStatus?: StatusCallback): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageTexts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    onStatus?.(`Reading PDF page ${pageNumber} of ${pdf.numPages}...`);
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const embeddedText = textContent.items
      .map((item) => (item as TextItem).str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (embeddedText.length > 40) {
      pageTexts.push(embeddedText);
    } else {
      const canvas = await renderPdfPageToCanvas(page);
      pageTexts.push(await runTesseract(canvas, onStatus));
    }
  }

  return pageTexts.join('\n\n').trim();
}

export async function extractReportText(file: File, onStatus?: StatusCallback): Promise<string> {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Please upload a file smaller than 10MB.');
  }

  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return extractPdfText(file, onStatus);
  }

  if (file.type.startsWith('image/')) {
    onStatus?.('Reading the report card...');
    return runTesseract(file, onStatus);
  }

  throw new Error('Please upload a JPG, PNG, or PDF report card.');
}
