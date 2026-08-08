'use client'

type Folder = 'products' | 'gallery' | 'fan-card' | 'catalog' | 'content'

/**
 * Upload via site API → public/uploads/{folder}/
 * No Firebase Storage.
 */
export async function uploadImage(
  file: File,
  folder: Folder = 'products',
  authToken?: string | null
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed')
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Image must be under 8MB')
  }

  const token =
    authToken ||
    (typeof window !== 'undefined' ? localStorage.getItem('adminSessionToken') : null)

  const form = new FormData()
  form.append('file', file)
  form.append('folder', folder)

  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Upload failed (${res.status})`)
  }
  if (!data.url) {
    throw new Error('Upload succeeded but no URL returned')
  }
  return data.url as string
}
