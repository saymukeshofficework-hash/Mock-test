// Renders the landing page's SAMPLE / PREVIEW images and the social share image.
//
// The sample pages are typeset from the opening part of three real chapters of the
// source notes (Google Drive folder "bridge course notes by Rakesh pandey"). Only the
// first few questions of 3 of the 40 chapters are included — never enough to rebuild
// the paid PDF — and every image carries a SAMPLE / PREVIEW watermark.
//
// Once the final compiled PDF exists, prefer real page renders instead:
//   pdftoppm -f 3 -l 3 -r 110 -png "content/source/Bridge Course Notes by Rakesh Pandey.pdf" page
// then crop/watermark them (see docs/BRIDGE_COURSE_IMPLEMENTATION.md → "Sample pages").
//
// Usage (needs `playwright` + `sharp` + @fontsource fonts resolvable from NODE_PATH):
//   FONT_DIR=/path/to/node_modules/@fontsource node scripts/previews/render-previews.mjs
import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { samplePages } from './samples.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const out = path.resolve(here, '../../public')
const F = process.env.FONT_DIR
if (!F) throw new Error('Set FONT_DIR to your node_modules/@fontsource directory')

const fontCss = `
@font-face{font-family:NS;font-weight:400;src:url(file://${F}/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-400-normal.woff2)}
@font-face{font-family:NS;font-weight:700;src:url(file://${F}/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-700-normal.woff2)}
@font-face{font-family:NSer;font-weight:700;src:url(file://${F}/noto-serif-devanagari/files/noto-serif-devanagari-devanagari-700-normal.woff2)}
@font-face{font-family:In;font-weight:400;src:url(file://${F}/inter/files/inter-latin-400-normal.woff2)}
@font-face{font-family:In;font-weight:600;src:url(file://${F}/inter/files/inter-latin-600-normal.woff2)}
@font-face{font-family:In;font-weight:700;src:url(file://${F}/inter/files/inter-latin-700-normal.woff2)}
@font-face{font-family:SS;font-weight:600;src:url(file://${F}/source-serif-4/files/source-serif-4-latin-600-normal.woff2)}
@font-face{font-family:SS;font-weight:700;src:url(file://${F}/source-serif-4/files/source-serif-4-latin-700-normal.woff2)}
`

const pageCss = `
${fontCss}
*{box-sizing:border-box;margin:0}
body{width:600px;height:780px;overflow:hidden;background:#fff;font-family:In,NS,sans-serif;color:#1b2536;font-size:12.5px;line-height:1.55}
.p{position:relative;height:780px;padding:34px 38px}
.brand{font-family:In;font-weight:700;letter-spacing:.14em;font-size:10.5px;color:#a25608;text-align:center}
.paper{margin-top:6px;text-align:center;font-weight:700;font-size:13px;color:#10213a}
h1{margin-top:10px;text-align:center;font-family:SS,NSer,serif;font-size:21px;line-height:1.3;color:#10213a}
.sub{margin:6px auto 0;max-width:470px;text-align:center;font-size:11.5px;color:#5b6f8c}
hr{border:0;border-top:2px solid #e8871e;width:70px;margin:14px auto 12px}
h2{margin:14px 0 6px;font-size:14px;font-weight:700;color:#10213a;border-left:4px solid #e8871e;padding-left:8px}
.q{font-weight:700;margin-top:8px}
.o{padding-left:14px}
.ok{padding-left:14px;font-weight:700;color:#17804f}
.ex{margin-top:4px;background:#f6f1e4;border-radius:6px;padding:6px 9px;font-size:12px}
.box{background:#f6f1e4;border-radius:8px;padding:8px 12px;margin-top:8px}
.box li{margin-left:16px}
table{width:100%;border-collapse:collapse;margin-top:8px;font-size:11.5px}
td,th{border:1px solid #d9cfb7;padding:4px 6px;vertical-align:top;text-align:left}
th{background:#10213a;color:#fff;font-weight:600}
.fade{position:absolute;left:0;right:0;bottom:0;height:230px;background:linear-gradient(to bottom,rgba(255,255,255,0),#fff 62%)}
.end{position:absolute;left:0;right:0;bottom:26px;text-align:center;font-family:In;font-weight:600;font-size:12px;color:#5b6f8c}
.wm{position:absolute;inset:-200px;display:flex;flex-wrap:wrap;align-content:center;justify-content:center;gap:90px 60px;transform:rotate(-28deg);pointer-events:none}
.wm span{font-family:In;font-weight:700;font-size:30px;letter-spacing:.12em;color:rgba(201,109,12,.11);white-space:nowrap}
.tag{position:absolute;top:12px;right:12px;background:#10213a;color:#fff;font-family:In;font-weight:700;font-size:10px;letter-spacing:.14em;padding:4px 8px;border-radius:4px}
`

function page(inner) {
  const wm = Array.from({ length: 24 }, () => '<span>SAMPLE / PREVIEW</span>').join('')
  return `<!doctype html><html><head><meta charset="utf-8"><style>${pageCss}</style></head><body>
  <div class="p">${inner}<div class="fade"></div><div class="end">— Preview ends here · full chapter in the PDF —</div>
  <div class="wm">${wm}</div><div class="tag">SAMPLE / PREVIEW</div></div></body></html>`
}

const ogHtml = (img) => `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss}
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;overflow:hidden;background:#10213a;font-family:In,sans-serif;color:#fbf7ee}
.w{position:relative;height:630px;padding:70px 76px}
.lines{position:absolute;inset:0;opacity:.07;background:repeating-linear-gradient(0deg,#fff 0 1px,transparent 1px 38px)}
.badge{display:inline-block;border:1.5px solid rgba(244,163,64,.6);color:#f4a340;border-radius:99px;padding:8px 18px;font-weight:700;letter-spacing:.2em;font-size:18px}
h1{margin-top:28px;font-family:SS,serif;font-weight:700;font-size:78px;line-height:1.02}
.by{margin-top:10px;font-family:SS,serif;font-weight:600;font-size:40px;color:#e6dcc4}
.price{margin-top:34px;display:flex;align-items:center;gap:22px}
.price b{font-family:SS,serif;font-size:84px;line-height:1}
.pill{background:#e8871e;color:#0b1526;font-weight:700;font-size:22px;padding:14px 24px;border-radius:16px}
.meta{margin-top:26px;font-size:22px;color:#a9b6c8}
img{position:absolute;right:70px;top:70px;width:360px;border-radius:8px;transform:rotate(4deg);box-shadow:0 30px 60px rgba(0,0,0,.45)}
</style></head><body><div class="w"><div class="lines"></div>
<span class="badge">BRIDGE COURSE 2.0</span><h1>Bridge Course<br>Notes</h1><p class="by">by Rakesh Pandey</p>
<div class="price"><b>₹199</b><span class="pill">Instant PDF access</span></div>
<p class="meta">6 papers · 40 chapter notes · Secure Razorpay payment</p>
<img src="${img}"></div></body></html>`

await mkdir(path.join(out, 'previews'), { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined })
const ctx = await browser.newContext({ deviceScaleFactor: 2 })
const p = await ctx.newPage()

for (const [i, s] of samplePages.entries()) {
  await p.setViewportSize({ width: 600, height: 780 })
  await p.setContent(page(s), { waitUntil: 'load' })
  await p.evaluate(() => document.fonts.ready)
  const png = await p.screenshot({ type: 'png' })
  const file = path.join(out, 'previews', `sample-${i + 1}.webp`)
  // 1200×1560 source → 600×780 @ q72: sharp enough to judge the layout, too small to
  // be a useful substitute for the PDF.
  await sharp(png).resize(600, 780).webp({ quality: 72 }).toFile(file)
  console.log('wrote', path.relative(process.cwd(), file))
}

await p.setViewportSize({ width: 1200, height: 630 })
const cover = await sharp(await readFile(path.join(out, 'previews', 'sample-1.webp'))).png().toBuffer()
await p.setContent(ogHtml(`data:image/png;base64,${cover.toString('base64')}`), { waitUntil: 'load' })
await p.evaluate(() => document.fonts.ready)
const og = await p.screenshot({ type: 'png' })
await sharp(og).resize(1200, 630).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(path.join(out, 'og-image.png'))
console.log('wrote public/og-image.png')
await browser.close()
