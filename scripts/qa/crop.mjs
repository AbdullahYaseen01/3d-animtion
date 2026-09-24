/** Splits a tall screenshot into viewport-height tiles for review. Usage: node scripts/qa/crop.mjs <png> [tileHeight] */
import sharp from 'sharp'

const [file, tileArg] = process.argv.slice(2)
const meta = await sharp(file).metadata()
const tile = Number(tileArg) || (meta.width < 768 ? 1400 : 1100)
const out = []
for (let top = 0, i = 0; top < meta.height; top += tile, i++) {
  const height = Math.min(tile, meta.height - top)
  const name = file.replace(/\.png$/, `.part${i}.png`)
  await sharp(file).extract({ left: 0, top, width: meta.width, height }).toFile(name)
  out.push(name)
}
console.log(out.join('\n'))
