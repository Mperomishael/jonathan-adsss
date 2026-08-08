'use client'

import { storage } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

/**
 * Upload an image file to Firebase Storage and return its public download URL.
 * Path: uploads/{folder}/{timestamp}-{safeName}
 */
export async function uploadImage(
  file: File,
  folder: 'products' | 'gallery' | 'fan-card' | 'catalog' | 'content' = 'products'
): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized. Check NEXT_PUBLIC_FIREBASE_* env vars.')
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed')
  }

  // ~8MB limit
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Image must be under 8MB')
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
  const path = `uploads/${folder}/${Date.now()}-${safeName}`
  const storageRef = ref(storage, path)

  await uploadBytes(storageRef, file, {
    contentType: file.type,
    cacheControl: 'public,max-age=31536000',
  })

  return getDownloadURL(storageRef)
}
