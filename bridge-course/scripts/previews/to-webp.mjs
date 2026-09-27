// Converts public/previews/sample-*.png (from render_previews_from_pdf.py) to 600×780 WebP.
import sharp from 'sharp'
import { readdir, unlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public/previews')
for (const f of (await readdir(dir)).filter((f) => /^sample-\d+\.png$/.test(f))) {
  const src = path.join(dir, f)
  await sharp(src).resize(600, 780, { fit: 'cover', position: 'top' }).webp({ quality: 74 }).toFile(src.replace(/\.png$/, '.webp'))
  await unlink(src)
  console.log('wrote', f.replace(/\.png$/, '.webp'))
}
