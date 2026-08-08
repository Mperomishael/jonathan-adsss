'use client'

import { useRef, useState } from 'react'
import { Upload, Loader2, X, ImageIcon } from 'lucide-react'
import { uploadImage } from '@/lib/upload'

type Folder = 'products' | 'gallery' | 'fan-card' | 'catalog' | 'content'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  folder?: Folder
  label?: string
  className?: string
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'products',
  label = 'IMAGE',
  className = '',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const url = await uploadImage(file, folder)
      onChange(url)
    } catch (e: any) {
      setError(e?.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const isData = value?.startsWith('data:')

  return (
    <div className={className}>
      <label className="text-gray-400 text-xs tracking-widest block mb-2">{label}</label>

      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
          {value ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-red-600"
                title="Remove image"
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <ImageIcon className="text-gray-600" size={28} />
          )}
        </div>

        <div className="flex-1 space-y-2 w-full">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-bold"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? 'Processing…' : value ? 'Replace image' : 'Upload image'}
          </button>
          <p className="text-gray-500 text-xs">
            JPG/PNG/WebP · max 1.5MB. Saved with the product in the database (works on Vercel).
            {isData ? ' · Embedded image ready — click Save on the form.' : ''}
          </p>
          {error && <p className="text-red-400 text-xs">{error}</p>}

          <input
            type="text"
            value={isData ? '' : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste /images/... or https://..."
            className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-red-500"
          />
          {isData && (
            <p className="text-green-400/80 text-xs">Embedded image loaded. Save the form to apply.</p>
          )}
        </div>
      </div>
    </div>
  )
}
