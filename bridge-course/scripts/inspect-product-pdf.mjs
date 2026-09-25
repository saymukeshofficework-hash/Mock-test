// Build and/or inspect the final sellable PDF before uploading it to PRIVATE storage.
//
//   Inspect an existing PDF:
//     npm run product:inspect -- "../content/source/Bridge Course Notes by Rakesh Pandey.pdf"
//
//   Merge per-chapter PDFs (exported from the Google Docs) in the order given by
//   ../content/source/manifest.json, then inspect the result:
//     npm run product:inspect -- --merge
//
// Prints page count, size, title metadata and the first page's text-free check, so you
// can confirm the file opens and is complete. Nothing is uploaded by this script.
import { PDFDocument } from 'pdf-lib'
import { readFile, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const sourceDir = path.resolve(here, '../../content/source')
const finalName = 'Bridge Course Notes by Rakesh Pandey.pdf'

async function merge() {
  const manifest = JSON.parse(await readFile(path.join(sourceDir, 'manifest.json'), 'utf8'))
  const out = await PDFDocument.create()
  out.setTitle('Bridge Course Notes by Rakesh Pandey')
  out.setAuthor('Rakesh Pandey')
  const missing = []
  for (const paper of manifest.papers) {
    for (const ch of paper.chapters) {
      const file = path.join(sourceDir, 'parts', ch.file)
      if (!existsSync(file)) {
        missing.push(ch.file)
        continue
      }
      const doc = await PDFDocument.load(await readFile(file))
      const pages = await out.copyPages(doc, doc.getPageIndices())
      pages.forEach((p) => out.addPage(p))
      console.log(`  + ${ch.file} (${pages.length} pages)`)
    }
  }
  if (missing.length) {
    console.error(`\nMissing ${missing.length} chapter PDF(s) in content/source/parts/:\n  ${missing.join('\n  ')}`)
    process.exit(1)
  }
  const target = path.join(sourceDir, finalName)
  await writeFile(target, await out.save())
  return target
}

async function inspect(file) {
  const bytes = await readFile(file)
  const doc = await PDFDocument.load(bytes) // throws if the file is not a readable PDF
  const { size } = await stat(file)
  const first = doc.getPage(0).getSize()
  console.log(`\nFile:        ${path.relative(process.cwd(), file)}`)
  console.log(`Size:        ${(size / 1024 / 1024).toFixed(2)} MB`)
  console.log(`Pages:       ${doc.getPageCount()}`)
  console.log(`Page size:   ${Math.round(first.width)} × ${Math.round(first.height)} pt`)
  console.log(`Title:       ${doc.getTitle() ?? '(none)'}`)
  console.log(`Encrypted:   ${doc.isEncrypted}`)
  if (size > 100 * 1024 * 1024) console.warn('WARNING: over the 100 MB bucket limit — compress before uploading.')
  console.log('\nNext: open the file and read the cover, the contents and a few pages from each paper.')
  console.log('Then upload it to bucket "bridge-course-private" at products/bridge-course-notes.pdf (docs/SUPABASE_SETUP.md).')
}

const args = process.argv.slice(2)
const file = args.includes('--merge') ? await merge() : path.resolve(args[0] ?? path.join(sourceDir, finalName))
if (!existsSync(file)) {
  console.error(`Not found: ${file}\nPlace the final PDF in content/source/ (see content/source/README.md).`)
  process.exit(1)
}
await inspect(file)
