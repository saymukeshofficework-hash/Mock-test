import { getPageDimsMm } from '../components/editor/pageSize'
import type { SchoolDocument } from '../types/document'

/**
 * One-click convenience export: rasterizes each .page-sheet at high resolution
 * and places it into a PDF sized to match the document's page settings exactly.
 * For maximum vector/text fidelity (searchable text, smaller file size), prefer
 * the "प्रिंट करें" (browser print → Save as PDF) path instead.
 */
export async function downloadDocumentAsPdf(doc: SchoolDocument, fileName: string): Promise<void> {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])
  const dims = getPageDimsMm(doc.pageSize, doc.orientation)
  const sheets = Array.from(document.querySelectorAll<HTMLElement>('.page-sheet'))
  if (sheets.length === 0) throw new Error('कोई पेज नहीं मिला')

  const pdf = new jsPDF({
    orientation: doc.orientation === 'landscape' ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [dims.w, dims.h],
  })

  // Force true physical size for the capture, regardless of the current
  // viewport's "shrink to fit small screens" scaling (see ScaleToFit).
  document.body.classList.add('pdf-exporting')
  try {
    for (let i = 0; i < sheets.length; i++) {
      const canvas = await html2canvas(sheets[i], {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        ignoreElements: (el) => el.classList.contains('no-print'),
      })
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      if (i > 0) pdf.addPage([dims.w, dims.h], doc.orientation === 'landscape' ? 'landscape' : 'portrait')
      pdf.addImage(imgData, 'JPEG', 0, 0, dims.w, dims.h, undefined, 'FAST')
    }
  } finally {
    document.body.classList.remove('pdf-exporting')
  }

  pdf.save(`${fileName}.pdf`)
}
