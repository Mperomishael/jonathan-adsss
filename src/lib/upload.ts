'use client'

type Folder = 'products' | 'gallery' | 'fan-card' | 'catalog' | 'content'

const MAX_BYTES = 1.5 * 1024 * 1024 // keep under Firestore practical limits

/**
 * Convert image to a data URL (base64) in the browser.
 * Works on Vercel — no disk write, no Firebase Storage.
 * Result is stored on the product/settings document in Firestore.
 */
export async function uploadImage(
  file: File,
  _folder: Folder = 'products',
  _authToken?: string | null
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Image must be under 1.5MB. Compress or resize it first.')
  }

  return fileToCompressedDataUrl(file)
}

function fileToCompressedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read image'))
    reader.onload = () => {
      const raw = reader.result as string
      if (file.size <= 400 * 1024) {
        resolve(raw)
        return
      }
      const img = new Image()
      img.onload = () => {
        const maxW = 1200
        const scale = Math.min(1, maxW / img.width)
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(raw)
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        const quality = file.type === 'image/png' ? 0.92 : 0.82
        resolve(
          canvas.toDataURL(
            file.type === 'image/png' ? 'image/png' : 'image/jpeg',
            quality
          )
        )
      }
      img.onerror = () => resolve(raw)
      img.src = raw
    }
    reader.readAsDataURL(file)
  })
}
