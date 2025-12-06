import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const IMAGES_DIR = path.join(__dirname, '../src/assets/images')
const EVENTS_DIR = path.join(IMAGES_DIR, 'events')

// 이미지 최적화 설정
const config = {
  webp: {
    quality: 80,
    effort: 6
  },
  resize: {
    // 이벤트 이미지 최대 너비
    events: 800,
    // 로고/헤더 이미지는 원본 유지
    logo: null
  }
}

async function optimizeImage(inputPath, outputPath, maxWidth = null) {
  try {
    let pipeline = sharp(inputPath)

    // 이미지 메타데이터 확인
    const metadata = await pipeline.metadata()
    console.log(`Processing: ${path.basename(inputPath)} (${metadata.width}x${metadata.height})`)

    // 리사이즈 (maxWidth가 설정되고 이미지가 더 큰 경우)
    if (maxWidth && metadata.width > maxWidth) {
      pipeline = pipeline.resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
    }

    // WebP로 변환
    await pipeline
      .webp(config.webp)
      .toFile(outputPath)

    // 파일 크기 비교
    const originalSize = fs.statSync(inputPath).size
    const newSize = fs.statSync(outputPath).size
    const savings = ((1 - newSize / originalSize) * 100).toFixed(1)

    console.log(`  ✓ ${path.basename(outputPath)}: ${formatBytes(originalSize)} → ${formatBytes(newSize)} (${savings}% saved)`)

    return { original: originalSize, optimized: newSize }
  } catch (error) {
    console.error(`  ✗ Error processing ${inputPath}:`, error.message)
    return null
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

async function main() {
  console.log('🖼️  Starting image optimization...\n')

  let totalOriginal = 0
  let totalOptimized = 0

  // Events 폴더 이미지 최적화
  console.log('📁 Processing events images...')
  const eventFiles = fs.readdirSync(EVENTS_DIR).filter(f =>
    /\.(png|jpg|jpeg)$/i.test(f) && !f.startsWith('.')
  )

  for (const file of eventFiles) {
    const inputPath = path.join(EVENTS_DIR, file)
    const outputName = file.replace(/\.(png|jpg|jpeg)$/i, '.webp')
    const outputPath = path.join(EVENTS_DIR, outputName)

    const result = await optimizeImage(inputPath, outputPath, config.resize.events)
    if (result) {
      totalOriginal += result.original
      totalOptimized += result.optimized
    }
  }

  // 루트 이미지 폴더 (로고 등)
  console.log('\n📁 Processing root images...')
  const rootFiles = fs.readdirSync(IMAGES_DIR).filter(f =>
    /\.(png|jpg|jpeg)$/i.test(f) && !f.startsWith('.')
  )

  for (const file of rootFiles) {
    const inputPath = path.join(IMAGES_DIR, file)
    const outputName = file.replace(/\.(png|jpg|jpeg)$/i, '.webp')
    const outputPath = path.join(IMAGES_DIR, outputName)

    // 로고/헤더 이미지는 리사이즈 없이 WebP 변환만
    const result = await optimizeImage(inputPath, outputPath, null)
    if (result) {
      totalOriginal += result.original
      totalOptimized += result.optimized
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`📊 Total: ${formatBytes(totalOriginal)} → ${formatBytes(totalOptimized)}`)
  console.log(`💾 Total saved: ${formatBytes(totalOriginal - totalOptimized)} (${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%)`)
  console.log('\n✅ Image optimization complete!')
  console.log('\n⚠️  Note: Update your code to use .webp files instead of .png/.jpg')
}

main().catch(console.error)
