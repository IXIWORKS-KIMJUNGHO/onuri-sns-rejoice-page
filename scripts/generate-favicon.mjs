import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PUBLIC_DIR = path.join(__dirname, '../public')
const SOURCE = path.join(__dirname, '../src/assets/images/header-icon.webp')

async function generateFavicon() {
  console.log('Generating favicon...')

  // 32x32 favicon
  await sharp(SOURCE)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC_DIR, 'favicon-32.png'))

  // 180x180 apple touch icon
  await sharp(SOURCE)
    .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'))

  // 192x192 for android
  await sharp(SOURCE)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC_DIR, 'icon-192.png'))

  // OG image (1200x630 recommended)
  await sharp(SOURCE)
    .resize(1200, 630, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .png()
    .toFile(path.join(PUBLIC_DIR, 'og-image.png'))

  console.log('Favicon and icons generated!')
}

generateFavicon().catch(console.error)
